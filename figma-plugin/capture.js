#!/usr/bin/env node
/**
 * BonVoye — capture.js
 * Mở mockup.html bằng Playwright, screenshot từng màn hình,
 * xuất ra mockup-screens.json để plugin Figma đọc.
 *
 * Chạy: node capture.js
 * Output: mockup-screens.json (~35 entries, mỗi entry có base64 PNG)
 */

"use strict";

const { chromium } = require("playwright-chromium");
const path = require("path");
const fs = require("fs");

const MOCKUP_FILE = path.resolve(__dirname, "../prototype/mockup.html");
const OUTPUT_FILE = path.resolve(__dirname, "mockup-screens.json");

// Danh sách màn hình bản đồ — sẽ chụp screenshot (không rebuild native nodes)
// Các màn còn lại sẽ được xử lý bằng native Figma nodes trong plugin.
const MAP_GROUPS = ["Bản đồ"];

async function main() {
  console.log("🚀 BonVoye capture.js");
  console.log("📄 Mở:", MOCKUP_FILE);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Kích thước đủ rộng để tất cả các tile và màn hình hiển thị
  await page.setViewportSize({ width: 1600, height: 900 });

  // Mở file local
  await page.goto("file://" + MOCKUP_FILE);

  // Chờ các màn hình render xong
  console.log("⏳ Chờ render...");
  await page.waitForSelector(".gal-cell", { timeout: 15000 });

  // Chờ thêm để tile OSM tải (nếu có internet)
  // Nếu không cần tile, đổi thành 500
  await page.waitForTimeout(3000);

  // Lấy danh sách tất cả màn hình từ DOM
  const scenes = await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll(".gal-cell"));
    return cells.map((cell, i) => {
      const screen = cell.querySelector(".screen");
      const cap = cell.querySelector(".gal-cap");
      const numEl = cap ? cap.querySelector(".num") : null;
      const titleEl = cap ? cap.querySelector("b") : null;
      const noteEl = cap ? cap.querySelector("p") : null;
      const screenEl = cell.querySelector("[data-bv-screenshot]");
      return {
        index: i,
        num: numEl ? numEl.textContent.trim() : String(i),
        title: titleEl ? titleEl.textContent.trim() : "Screen " + i,
        note: noteEl ? noteEl.textContent.trim() : "",
        screenshotId: screenEl ? screenEl.dataset.bvScreenshot : "screen-" + i,
        screenId: screen ? screen.dataset.bvScreen : null,
        kind: screen ? screen.dataset.bvScreenKind : null,
        // group từ data attribute không có — lấy từ caption heading trước đó
        group: null,
      };
    });
  });

  // Lấy group mapping: kiếm heading trong filter bar
  // groups xuất hiện theo thứ tự trong SCENES array, không có heading trong DOM cells
  // Nên inject script để lấy trực tiếp từ MU.scenes
  const sceneGroups = await page.evaluate(() => {
    if (window.MU && window.MU.scenes) {
      return window.MU.scenes.map(function(s, i) {
        return { index: i, group: s.group || "Khác", num: s.num, title: s.title };
      });
    }
    return [];
  });

  // Merge group info
  const groupMap = {};
  sceneGroups.forEach(sg => { groupMap[sg.index] = sg.group; });
  scenes.forEach(sc => { sc.group = groupMap[sc.index] || "Khác"; });

  console.log("📸 Tổng số màn:", scenes.length);

  const results = [];

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const isMapScreen = MAP_GROUPS.includes(sc.group);

    process.stdout.write(
      `  [${String(i + 1).padStart(2)}/${scenes.length}] ${sc.num} — ${sc.title.slice(0, 50)}...`
    );

    // Tìm .screen element trong cell này
    const cellSelector = `.gal-cell:nth-child(${i + 1}) .screen`;
    const screenEl = await page.$(cellSelector);

    let pngBase64 = null;

    if (screenEl) {
      try {
        // Scroll vào view trước khi chụp
        await screenEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);

        const buf = await screenEl.screenshot({ type: "png" });
        pngBase64 = buf.toString("base64");
        process.stdout.write(" ✓\n");
      } catch (e) {
        process.stdout.write(` ⚠ lỗi: ${e.message}\n`);
      }
    } else {
      process.stdout.write(" ⚠ không tìm thấy .screen\n");
    }

    results.push({
      index: i,
      num: sc.num,
      title: sc.title,
      group: sc.group,
      note: sc.note,
      screenshotId: sc.screenshotId,
      pngBase64: pngBase64,
      // Flag để plugin biết dùng screenshot hay rebuild native
      isMapScreen: isMapScreen,
    });
  }

  await browser.close();

  // Lưu JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  const sizeKB = Math.round(fs.statSync(OUTPUT_FILE).size / 1024);
  console.log(`\n✅ Đã lưu: ${OUTPUT_FILE} (${sizeKB} KB)`);
  console.log(`   ${results.length} màn hình, ${results.filter(r => r.pngBase64).length} có ảnh`);
}

main().catch(err => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});

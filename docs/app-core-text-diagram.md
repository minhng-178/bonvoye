# App Core BonVoye — Text Diagram toàn luồng

> **Mục đích:** như `cms-text-diagram.md` nhưng cho phía **app** (không phải CMS) — để
> review mức độ chi tiết trước khi thiết kế thật, và dùng lại làm input cho design tool.
> Toàn bộ vẽ bằng ký tự, không cần tool nào để xem.
>
> **Ngày:** 2026-07-29 · **Nguồn:** thảo luận nội bộ 27–28/07 về luồng trải nghiệm app
> (Fake GPS, geofence, story mode, testing).
>
> Ký hiệu dùng xuyên suốt: **Hiện tại** = hành vi app đang có hôm nay, **Đề xuất** = mới
> dừng ở mức thảo luận, chưa chốt thiết kế.

---

## PHẦN 1 — BẢN ĐỒ MÀN HÌNH

```text
                        ┌──────────────────────┐
                        │ 01 Home — chọn City  │
                        │    & Topic           │
                        └──────────┬───────────┘
                                   ▼
                  ┌─────────────────────────────────┐
                  │ 02 Màn hình Bản đồ (fullscreen) │  ◀── TRỌNG TÂM
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ 03 Panel xin     │      │ 04 Dev Panel /   │      │ 05 NPC chooser / │
│    quyền vị trí  │      │    Simulate GPS  │      │    story sheet   │
└──────────────────┘      └──────────────────┘      └────────┬─────────┘
                                                             ▼
                                                    ┌──────────────────┐
                                                    │ 06 Story sheet:  │
                                                    │  audio ⇄ webtoon │
                                                    └────────┬─────────┘
                                                             ▼
                                                    ┌──────────────────┐
                                                    │ 07 Hành Trình /  │
                                                    │  "Đã khám phá"   │
                                                    └──────────────────┘

Đề xuất mới (chưa có màn, mới dừng ở ý tưởng thảo luận):
   08  Panel "Kéo vị trí" (Fake GPS trong tay user)
   09  Popup "vị trí đã được đưa về thật"
   10  Màn hình xin quyền generic ("thiếu quyền gì?")
```

### Danh sách đầy đủ

```text
STT  MÀN                          VÀO TỪ ĐÂU                TRẠNG THÁI
═══════════════════════════════════════════════════════════════════════════
01   Home — chọn City & Topic     mở app                    Hiện tại
02   Bản đồ fullscreen            sau Home                  Hiện tại
─────────────────────────────────────────────────────────────────────────────
03   Xin quyền vị trí (OS)        lần đầu vào map            Hiện tại
                                                              (theo hệ điều hành,
                                                               chưa có màn generic)
04   Dev panel / Simulate GPS     nút dev trên map           Hiện tại
05   NPC chooser (nhiều NPC       vào vùng ≥2 NPC cùng lúc   Hiện tại
     cùng trong tầm)
06   Story sheet (audio/webtoon)  chọn NPC / auto-trigger    Hiện tại
07   Hành Trình / Đã khám phá     tab riêng trên map         Hiện tại
     (danh sách NPC đã mở)
─────────────────────────────────────────────────────────────────────────────
08   Panel "Kéo vị trí" (Fake GPS)  long-press / kéo trên map Đề xuất — PHẦN 4
09   Popup tự động trả vị trí thật  hệ thống tự bật           Đề xuất — PHẦN 5
10   Màn xin quyền generic          bất kỳ hành động thiếu    Đề xuất — PHẦN 9
                                    quyền (location, notif...)
11   Geofence background trigger    app ở nền / màn hình tắt  Đề xuất — PHẦN 9
```

⚠ Màn 08–11 là phần **chưa được xây**, tài liệu này soạn để thống nhất hành vi trước khi
thiết kế/code, đúng tinh thần Harness Method — spec trước, code sau.

⚠ **Hidden Thread/Series (CMS màn 12) và Đa ngôn ngữ (CMS màn 14) chưa có mặt trong bản
đồ màn hình này.** Chưa có màn/luồng nào mô tả user gặp Hidden Thread bằng cách nào, hay
chọn ngôn ngữ hiển thị ở đâu trong app. Đề xuất Hidden Thread/Series xem PHẦN 8. Đề xuất
ngôn ngữ ngay bên dưới.

### Đề xuất chọn ngôn ngữ hiển thị

```text
┌─── HOME (màn 01) ──────────────────────────────────────────┐
│                                                              │
│   🌐 [ngôn ngữ đang chọn] ▾        [tên app]                │  ← đổi vi/en/zh, lưu
│                                                              │    trên máy, không
│                                                              │    cần tài khoản
│   Chọn thành phố    [tên city đã chọn]        ▾              │
│   Chọn tuyến        [tên topic đã chọn]       ▾              │
│                                                              │
│              [ Bắt đầu khám phá ]                           │  ← CTA, sang màn 02
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Mặc định lần đầu mở app:

```text
theo locale máy nếu khớp vi/en/zh   ──▶  dùng locale đó
không khớp (máy để ngôn ngữ khác)   ──▶  mặc định "vi" (app gốc tiếng Việt)
```

Ngôn ngữ dự phòng khi 1 item thiếu bản dịch (CMS cho publish thiếu dịch — xem
`cms-text-diagram.md` PHẦN 10): luôn là **"vi"**, vì đây là ngôn ngữ CMS bắt nhập trước
tiên trong luồng nhập liệu (`cms-text-diagram.md` PHẦN 3, bước [2]: "Nhập tiêu đề
vi/en/zh" — vi luôn có, en/zh tuỳ chọn). Khi rơi vào ca này, hiện kèm nhãn nhỏ "(bản dịch
[ngôn ngữ đang chọn] chưa có, hiển thị tiếng Việt)" để user không tưởng app lỗi.

---

## PHẦN 2 — LUỒNG/MÀN NÀO KHÓ

Chỉ có một cụm thật sự khó: cơ chế Fake GPS + tự động reset. Còn lại là hành vi map/story
chuẩn đã có sẵn mẫu.

```text
ĐỘ KHÓ                CỤM                          VÌ SAO
════════════════════════════════════════════════════════════════════════════
█████████████  Fake GPS kéo + máy trạng thái      4 điều kiện phải chạy ĐỘC LẬP,
                4-điều-kiện reset (PHẦN 4-5)       có điều kiện đo bằng khoảng cách,
                                                    có điều kiện đo bằng thời gian,
                                                    một điều kiện phải "nhịn" nếu
                                                    đang phát audio — dễ đá nhau.
──────────────────────────────────────────────────────────────────────────
██████         Geofence background (PHẦN 9)       phụ thuộc permission "Always"
                                                    của OS, có giới hạn cứng của
                                                    iOS (throttle geofence event),
                                                    khó test vì không thấy log khi
                                                    app ở nền.
██████         Popup "buffer 60s tránh giật lùi"   phải phân biệt "GPS nhiễu tạm    
                (PHẦN 5)                           thời" và "user đã rời chỗ kéo" —
                                                    hai ca nhìn giống nhau lúc đầu.
██████         Offline: tải & dùng gói POI          gói 150MB phải resume được, verify
                (PHẦN 9b)                           checksum, chỉ ready khi ĐỦ; còn 2
                                                    rủi ro chưa có lời giải (trần tile
                                                    pack Mapbox, ngưỡng dung lượng).
█████          Hiển thị artwork phủ map             đọc 4 góc + opacity từ CMS, hai hệ
                (PHẦN 6b)                           toạ độ song song (px tranh vs GPS),
                                                    phải chọn đúng cái theo lớp đang xem.
█████          Story mode: audio ⇄ webtoon         hành vi đã có, nhưng thêm field
                + playable khi tắt màn hình         "phát được khi tắt màn hình" cần
                (PHẦN 7)                            đồng bộ với phần audio nền OS.
────────────────────────────────────────────────────────────────────────
███            Màn xin quyền generic (PHẦN 9)      UX, không phải toán — nhưng phải
                                                    generic cho MỌI loại quyền thiếu,
                                                    không viết riêng từng case.
██             Hành Trình / Đã khám phá             hành vi đã có,
                (PHẦN 8)                            mẫu quen, chỉ thêm sync server.
```

**Kết luận:** làm kỹ **Fake GPS + máy trạng thái reset**, làm vừa **Geofence background**,
**Offline** và **hiển thị artwork**, còn lại là mẫu quen hoặc đã có sẵn.

⚠ Hai cụm **Offline (PHẦN 9b)** và **Artwork (PHẦN 6b)** không khó về mặt logic như Fake GPS,
nhưng là **điều kiện để sản phẩm dùng được**: artwork là giá trị bán được, offline là điều
kiện dùng được ngoài đường. Không phải phần cắt được khi hụt thời gian.

---

## PHẦN 3 — LUỒNG CHÍNH: USER MỞ APP ĐẾN LÚC HOÀN THÀNH 1 POI

Đây là hành trình user trải nghiệm mỗi lần dùng app, bổ sung nhánh Fake GPS theo thảo luận
27–28/07.

```text
BẮT ĐẦU
   │
   ├─▶ [1] Home — chọn City & Topic
   │
   ├─▶ [2] Vào màn Bản đồ fullscreen
   │       ├── Tải lớp TRANH VẼ phủ lên map (một lần cho cả vùng) — PHẦN 6b
   │       └── Kiểm tra quyền Location
   │             ├─ Chưa có ──▶ [3] Xin quyền "While Using"
   │             │                 ├─ Từ chối ──▶ App chạy giới hạn (chỉ xem/offline)
   │             │                 └─ Đồng ý  ──▶ bắt đầu Tracking GPS thực
   │             └─ Đã có ──▶ bắt đầu Tracking GPS thực
   │
   ├─▶ [2b] (khuyến nghị trước khi ra đường) Tải gói POI về máy — PHẦN 9b
   │       ├── chọn gói: đầy đủ ~150MB / chỉ audio ~20MB
   │       └── xong ──▶ POI chuyển trạng thái "ready", dùng được khi mất mạng
   │
   ├─▶ [3] User di chuyển
   │       ├── Di chuyển THẬT (GPS thực)                    Hiện tại
   │       │     └──▶ vào bán kính "trong tầm" quanh NPC (mặc định ~20m)
   │       │
   │       └── Kéo vị trí trên bản đồ (Fake GPS)             Đề xuất — PHẦN 4
   │             ├── trong 300m kể từ vị trí GPS thực cuối ──▶ cho kéo
   │             └── vượt 300m ──▶ chặn / báo đỏ
   │
   ├─▶ [4] Vào tầm NPC
   │       ├── 1 NPC trong tầm  ──▶ mở thẳng story sheet
   │       └── ≥2 NPC cùng tầm  ──▶ [5] NPC chooser, user chọn 1
   │
   ├─▶ [6] Story sheet — chế độ trải nghiệm
   │       ├── Audio narration   (đi bộ, tay bận, đeo tai nghe)
   │       └── Webtoon           (ngồi nghỉ, cầm máy, đọc khung truyện)
   │       (thứ tự các lớp nội dung theo field `order` — xem CMS PHẦN 6)
   │
   ├─▶ [7] Hoàn thành POI
   │       └── Lưu progress (ẩn danh hoặc theo tài khoản)
   │             └──▶ chuyển NPC vào "Hành Trình / Đã khám phá"
   │
   └─▶ (song song, chạy nền) Máy trạng thái reset Fake GPS — xem PHẦN 5
KẾT THÚC (của một lượt), nhưng Tracking tiếp tục chạy cho POI kế tiếp
```

**Lưu ý:** bước [4] tách rõ nhánh **1 NPC** và **≥2 NPC** vì đây là hai luồng UX khác
nhau, cần giữ riêng khi viết spec — không gộp lại cho gọn.

⚠ **Bước [3]-[4] mô tả đúng hành vi HÔM NAY**: khoảng cách được tính TỪNG NPC một (mỗi
NPC có bán kính riêng ~20m, xem PHẦN 11), không phải tới POI. "≥2 NPC cùng tầm" ở bước
[4] hôm nay là 2 vòng tròn 20m của 2 NPC riêng biệt tình cờ chồng nhau tại vị trí user.

Điều này sẽ đổi Ý NGHĨA sau khi CMS PHẦN 5 triển khai (xem PHẦN 6): bán kính vào/ra/thời
gian đứng được cấu hình ở CẤP POI, không phải cấp NPC — nghĩa là "≥2 NPC cùng tầm" khi đó
không còn là trùng hợp của 2 vòng tròn riêng, mà là hệ quả tự nhiên của việc nhiều NPC
cùng nằm trong MỘT vùng tương tác chung của POI cha. Kết quả UX giống nhau (vẫn hiện NPC
chooser), nhưng bản chất đổi từ "kiểm tra theo từng NPC" sang "kiểm tra theo POI, rồi
liệt kê NPC con nằm trong đó" — không phải chỉ đổi con số bán kính.

---

## PHẦN 4 — FAKE GPS: KÉO VỊ TRÍ, GIỚI HẠN 300M

### Vì sao cần giới hạn

Trích thảo luận nội bộ (2026-07-27): *"phải có giới hạn... ví dụ sửa nhưng không được quá
200m... chắc chắn phải có một hạn trần, ví dụ 500m hoặc 1km, không được kéo xa quá. Nếu
kéo xa đến tận thành phố khác thì sai mục đích."*

Thảo luận sau đó chốt số cụ thể: **300m tính từ vị trí GPS thực cuối cùng** — không phải
300m cộng dồn qua nhiều lần kéo, để chặn việc kéo nối tiếp nhiều lần đi xa hàng km.

```text
   Vị trí GPS THỰC cuối cùng
          │
          │  bán kính 300m
          ▼
   ┌─────────────────────────┐
   │                         │
   │      ◉ GPS thực         │   trong vòng tròn: cho kéo tự do
   │                         │
   │            ✕ kéo tới đây│   ngoài vòng tròn: CHẶN, báo đỏ
   └─────────────────────────┘

   ⚠ Mốc "300m" LUÔN đo từ GPS THỰC, không đo từ vị trí đã kéo lần trước.
     Nếu đo từ vị trí đã kéo thì user kéo 3 lần liên tiếp = đi xa 900m —
     đúng lỗi cảnh báo ban đầu ("kéo nối tiếp đi xa hàng km").
```

### Vì sao 300m, không phải 200m hay 500m-1km

```text
Gợi ý ban đầu                 Số đã chốt
──────────────────────────────────────────────────────────
"không quá 200m" (phụ)        300m — nằm giữa 200m và mốc trần 500m-1km
"trần 500m-1km" (chính)       đủ để test một khu phố/di tích,
                              không đủ để "nhảy" sang thành phố khác
```

300m đủ rộng để test toàn bộ một cụm POI trong cùng khu phố cổ nhưng không đủ để đi xuyên
quận.

⚠ **Chỗ này đang dựa vào một con số CHƯA XÁC NHẬN.** Lập luận "300m đủ rộng" ở trên lấy mốc
so sánh là khu di tích ~150m trong `cms-text-diagram.md` PHẦN 12 — nhưng 150m ở đó chỉ là
**giả định để quy đổi px sang mét**, chính CMS PHẦN 14 (câu 3) vẫn đang hỏi kích thước thật.
Nếu khu thật rộng 300m thay vì 150m thì kết luận "300m đủ" sụp. Cần số thật trước khi chốt
hằng số kéo.

⚠ **Chưa đối chiếu với POI dạng dài.** `cms-text-diagram.md` PHẦN 5 (và PHẦN 15a) nêu ví dụ
Văn Miếu ~350×120m dùng "vẽ vùng" (polygon) thay vì bán kính — dài hơn cả giới hạn kéo 300m.
Nếu admin đứng ở một đầu Văn Miếu và neo GPS thực tại đó, kéo Fake GPS theo hằng số cứng
300m sẽ KHÔNG tới được đầu kia (350m > 300m).

### Đề xuất: giới hạn kéo theo kích thước thật của POI, không dùng một hằng số cứng

```text
POI dùng bán kính (hình gọn)          POI dùng vẽ vùng (hình dài, vd Văn Miếu)
──────────────────────────────────────────────────────────────────────────────
giữ nguyên trần 300m                  giới hạn kéo = khoảng cách xa nhất giữa 2
(đã đủ rộng cho hình gọn)             điểm trong vùng đã vẽ, + biên độ an toàn
                                       (vd +50m)
                                       → lấy trực tiếp từ vùng CMS đã lưu cho
                                         POI đó, không hardcode 300m cho mọi POI
```

Tinh thần giữ nguyên: vẫn không cho kéo ra khỏi "khu vực hợp lý để test", chỉ thay hằng
số cứng 300m bằng "kích thước vùng thật của POI + biên độ", để không chặn oan các POI cố
tình dài như Văn Miếu.

---

## PHẦN 5 — MÁY TRẠNG THÁI: 4 ĐIỀU KIỆN TỰ ĐỘNG TRẢ VỀ GPS THẬT

Đề xuất chi tiết từ thảo luận nội bộ (2026-07-27):

```text
┌─────────────────────────────────────────────────────────────────────┐
│  ĐANG Ở TRẠNG THÁI "FAKE GPS" (vị trí đã kéo)                        │
└─────────────────────────────────────────────────────────────────────┘
       │
       │  4 điều kiện, chạy SONG SONG — bất kỳ điều kiện nào chạm trước
       │  thì trigger reset (trừ khi bị "nhịn" bởi ngoại lệ audio, xem dưới)
       │
   ┌───┼──────────────┬──────────────────┬───────────────────┐
   ▼   ▼              ▼                  ▼                   ▼
┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐
│ 1. HẾT     │  │ 2. USER ĐÃ  │  │ 3. THOÁT     │  │ 4. TÍN HIỆU GPS    │
│    THỜI    │  │    ĐI ĐẾN   │  │    MÀN HÌNH  │  │    TỐT TRỞ LẠI     │
│    GIAN    │  │    NƠI      │  │              │  │                    │
│            │  │             │  │              │  │                    │
│ 15 phút    │  │ vào bán     │  │ user rời     │  │ giữ vị trí kéo TỐI │
│ (phòng hờ  │  │ kính <50m   │  │ khỏi màn     │  │ THIỂU 60 giây, rồi │
│ user quên) │  │ so với điểm │  │ hình POI đó  │  │ mới cho phép reset │
│            │  │ đã kéo (GPS │  │              │  │ theo GPS thực —    │
│            │  │ thật lúc đó │  │              │  │ tránh GPS vừa      │
│            │  │ đã đủ tốt)  │  │              │  │ nhiễu báo sai đã   │
│            │  │             │  │              │  │ tự nhảy giật lùi   │
└────────────┘  └─────────────┘  └──────────────┘  └────────────────────┘
       │               │                 │                    │
       └───────────────┴─────────────────┴────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  RESET về GPS thực              │
              │  + popup thông báo NHẸ cho user │
              └───────────────────────────────┘

   ⚠ NGOẠI LỆ — không cắt mạch trải nghiệm:
   ┌─────────────────────────────────────────────────────────────────┐
   │ Nếu user ĐANG NGHE audio story lúc đến hạn reset (bất kỳ điều   │
   │ kiện nào trong 4 điều kiện trên), app vẫn cho audio phát hết,   │
   │ CHỈ reset ở lần tương tác kế tiếp — không dừng audio giữa chừng.│
   └─────────────────────────────────────────────────────────────────┘
```

### Vì sao cần "buffer 60s" (điều kiện 4) — đây là chỗ dễ hiểu lầm nhất

```text
Không có buffer:                          Có buffer 60s:

GPS thật đo được: 24m → 60m → 25m         GPS thật đo được: 24m → 60m → 25m
   ✓ tốt  ✗ nhiễu  ✓ tốt                     ✓ tốt   ✗ nhiễu   ✓ tốt
   → app LẬP TỨC nhảy vị trí kéo về         → giữ vị trí kéo ít nhất 60s trước
     GPS thật ngay khi thấy "tốt", rồi        khi coi tín hiệu là "tốt trở lại"
     lại nhảy về Fake GPS khi GPS lại         thật sự → không giật hình liên tục
     nhiễu → user thấy pin nhảy giật lùi
     liên tục, tưởng app lỗi
```

Đây chính là lý do điều kiện 4 KHÔNG đơn giản là "GPS tốt thì reset ngay" — phải thêm độ
trễ để phân biệt "tín hiệu tốt lên thoáng qua" với "tín hiệu đã thật sự ổn định".

### Vì sao cần popup — không âm thầm reset

Reset âm thầm khiến user không hiểu vì sao vị trí "tự nhiên" nhảy về chỗ cũ giữa lúc đang
test — nhất là khi đang dùng Dev panel để mô phỏng. Popup nhẹ (không phải dialog chặn thao
tác) chỉ cần nói rõ lý do reset (hết giờ / đã tới nơi / thoát màn / tín hiệu tốt) để user
không nhầm là lỗi.

### Bảng số liên quan

```text
Giới hạn kéo tối đa (từ GPS thực)        300 m
Bán kính coi là "đã tới nơi"              50 m    (điều kiện 2)
Thời gian hết hạn tự reset                15 phút (điều kiện 1)
Buffer giữ vị trí trước khi reset          60 giây (điều kiện 4)
Bán kính "trong tầm" NPC (hiện tại)        20 m
```

⚠ Có 2 con số 20m (proximity NPC, hiện tại) và 50m (đã-tới-nơi cho Fake GPS reset, đề
xuất) — **khác mục đích, đừng gộp làm một hằng số.** 20m quyết định NPC có mở hay không;
50m chỉ quyết định lúc nào tắt chế độ giả lập.

⚠ **50m cũng chỉ là một vòng tròn giả định, không phải hình dạng vùng tương tác thật.**
Với POI dùng chế độ "vẽ vùng" (polygon, xem `cms-text-diagram.md` PHẦN 5), vùng tương
tác thật KHÔNG tròn — nhưng điều kiện 2 ở đây vẫn dùng khoảng cách thẳng 50m quanh điểm
đã kéo để coi là "đã tới nơi". Hai hệ hình học khác nhau (tròn cho việc tắt Fake GPS,
polygon cho việc mở NPC) đang chạy song song mà không tài liệu nào nói rõ — dễ khiến
người đọc tưởng 50m là bán kính kích hoạt NPC thật. Ghi rõ: 50m chỉ là ngưỡng kỹ thuật
của cơ chế test, độc lập với vùng tương tác POI dùng để mở NPC.

### Đề xuất: hợp nhất "đã tới nơi" với vùng tương tác thật của POI

```text
Điểm đã kéo NẰM GẦN 1 POI cụ thể            Điểm đã kéo KHÔNG thuộc POI nào
──────────────────────────────────────────────────────────────────────────────
dùng CHÍNH vùng tương tác của POI đó        fallback: vòng tròn mặc định 50m
(bán kính vào, hoặc vùng vẽ tay nếu         quanh điểm đã kéo
POI dùng polygon)
"đã tới nơi" = user đã thật sự vào lại      "đã tới nơi" = user đến trong 50m
đúng vùng tương tác đó                      quanh điểm đã kéo
```

Cách này hợp nhất hai hệ hình học làm một: điều kiện "đã tới nơi" (tắt Fake GPS) và điều
kiện "mở NPC" (PHẦN 6) dùng chung một định nghĩa vùng — không còn hai con số độc lập
không liên quan tới nhau. 50m mặc định chỉ còn dùng cho ca hiếm: điểm user kéo tới không
nằm gần POI nào (test tự do, chưa neo vào nội dung cụ thể).

---

## PHẦN 6 — VÙNG TƯƠNG TÁC PHÍA APP (đối chiếu với CMS)

Hiện tại app dùng **một** bán kính duy nhất (mặc định ~20m) để kiểm tra "trong tầm NPC",
tính khoảng cách thẳng từ user **tới từng NPC**, không có hysteresis vào/ra, không có
thời gian đứng tối thiểu.

`cms-text-diagram.md` PHẦN 5 và PHẦN 11 đã đề xuất phía **CMS** cấu hình 3 con số, nhưng
ở CẤP **POI** chứ không phải cấp NPC: bán kính vào 25m, bán kính ra 35m, thời gian đứng 3
giây — để chống NPC nhấp nháy do GPS dao động. `cms-text-diagram.md` PHẦN 14 (câu 2) **đề
xuất** hướng: NPC không có vùng tương tác riêng, dùng chung vùng của POI cha (toạ độ riêng
của NPC chỉ dùng để đặt NPC lên tranh/bản đồ, không dùng để tính bán kính).

⚠ **Đây là ĐỀ XUẤT, chưa chốt.** CMS PHẦN 14 tên là "CÂU HỎI CÒN LẠI", câu 2 ghi *"hiện giả
định chỉ POI"*. Toàn bộ mô hình bên dưới ("đo tới POI thay vì đo tới NPC") dựng trên giả
định này — nếu chốt khác thì phải viết lại cả phần này. Cần xác nhận trước khi code.

Nghĩa là khi CMS-side triển khai, đây **không chỉ là đổi con số 20m → 25m/35m**, mà là
đổi **đối tượng được đo khoảng cách**: từ "khoảng cách tới từng NPC" sang "khoảng cách
tới vùng tương tác của POI cha", rồi liệt kê các NPC con nằm trong POI đó:

```text
HIỆN TẠI (đo tới từng NPC)                    SAU KHI CMS PHẦN 5 TRIỂN KHAI (đo tới POI)
─────────────────────────────────────────────────────────────────────────────────────
Với MỖI NPC riêng lẻ:                         Với MỖI POI:
  khoảng cách  user ─── NPC                     khoảng cách (hoặc vị trí trong vùng vẽ)
       │                                             user ─── vùng tương tác POI
       ▼                                                  │
  ≤ 20m ──▶ NPC "trong tầm"                           vào ≤ bán kính VÀO
                                                           ──▶ chờ đủ thời gian đứng
                                                                ──▶ POI "trong tầm"
                                                      ra > bán kính RA ──▶ POI "ngoài tầm"

                                               POI "trong tầm" ──▶ lấy danh sách NPC
                                               con của POI đó (PHẦN 3, bước [4]):
                                                 1 NPC   ──▶ mở thẳng story sheet
                                                 ≥2 NPC  ──▶ NPC chooser
```

Đây là điểm nối giữa hai tài liệu — app không tự quyết định con số, chỉ đọc cấu hình do
CMS lưu theo từng POI (bán kính vào/ra/thời gian đứng, hoặc vùng vẽ tay). Xem ghi chú ở
PHẦN 3 (bước [3]-[4]) — luồng chính hiện mô tả đúng hành vi HÔM NAY (theo từng NPC), sẽ
cần cập nhật câu chữ khi đổi sang mô hình theo POI này.

---

## PHẦN 6b — HIỂN THỊ TRÊN BẢN ĐỒ: ARTWORK, NHÃN, CỠ NPC, VÙNG TOPIC

Đây là phần app **tiêu thụ** toàn bộ công sức của CMS PHẦN 4 (căn artwork — màn khó nhất
phía CMS). Không có phần này thì việc căn chỉnh ở CMS không dẫn tới đâu.

### Hai lớp bản đồ, một công tắc

Technical Design §8.1 đã chốt cơ chế: Mapbox làm nền, tranh minh hoạ phủ lên bằng
**raster/image source**, và có toggle *"Xem Map thực tế"* để giảm opacity lớp tranh.

```text
┌─── MÀN BẢN ĐỒ (màn 02) ─────────────────────────────────┐
│                                                          │
│   ⌂⌂⌂⌂⌂ lớp TRANH VẼ (raster/image source)              │  ← opacity đọc từ
│   ⌂⌂⌂⌂⌂⌂⌂  📍 POI   👤 NPC   🏷 nhãn                     │    artwork.opacity_default
│   ⌂⌂⌂⌂⌂                                                  │
│   ─────────────────────────────────────                  │
│   đường phố thật (Mapbox base)                           │
│                                                          │
│                                    ┌──────────────────┐  │
│                                    │ 🗺 Xem Map thật  │  │  ← toggle, giảm opacity
│                                    └──────────────────┘  │    lớp tranh để lộ nền
└──────────────────────────────────────────────────────────┘
```

**Toggle này không phải tuỳ chọn trang trí.** Tranh vẽ tay không đúng tỉ lệ, nên khi user
thấy pin của mình lệch so với cảm nhận thực địa, toggle là đường thoát: xem map thật để
định hướng lại. Đây cũng là lý do `opacity_default` cấu hình được ở CMS chứ không hard-code.

### Ảnh tranh gắn ở cấp CITY, không phải cấp POI

Điểm dễ nhầm khi đọc schema:

```text
artwork          id · city_id · calibration JSONB    ◀ ảnh thuộc CITY
poi.artwork_id   trỏ tới artwork nào                 ◀ POI chỉ THAM CHIẾU
poi.artwork_position  {x,y} vị trí POI TRÊN tranh đó
```

Nghĩa là **nhiều POI dùng chung một tranh** — một tranh cho cả khu phố cổ, mỗi POI là một
điểm trên tranh đó. App tải tranh **một lần cho cả vùng**, không tải lại theo từng POI.

### Hai hệ toạ độ song song — dùng cái nào lúc nào

CMS lưu **cả hai** và không suy ra lẫn nhau (Technical Design dòng 375). App phải tôn trọng
điều đó:

```text
Đang xem                      Vẽ POI/NPC theo            Vì sao
──────────────────────────────────────────────────────────────────────────────
Lớp tranh (mặc định)          artwork_position {x,y}     khớp đúng chỗ hoạ sĩ vẽ
Map thật (đã bật toggle)      location (GPS)             khớp đúng vị trí thực địa
Tính geofence / khoảng cách   location (GPS) — LUÔN LUÔN  không bao giờ dùng px
```

⚠ **Không suy `artwork_position` từ GPS lúc chạy.** Phép căn affine chỉ dùng ở CMS để *gợi
ý* cho admin; giá trị cuối là do admin chốt. App đọc thẳng giá trị đã lưu.

### Nhãn di tích — cần `anchor`, không đặt trùng pin

CMS PHẦN 6 đề xuất bảng `poi_label` với `artwork_position` riêng và `anchor`
(trên/dưới/trái/phải). App render theo đúng `anchor` đó:

```text
    Đặt nhãn TRÙNG pin              Đặt lệch theo anchor='bottom'
    ───────────────────             ─────────────────────────────
      ⌂⌂⌂⌂⌂                            ⌂⌂⌂⌂⌂
      ⌂┌────────┐⌂                     ⌂⌂⌂⌂⌂⌂⌂
      ⌂│Ô Quan..│⌂  ← che tranh          📍
      ⌂└────────┘⌂                    ┌────────┐
      ⌂⌂⌂⌂⌂                          │Ô Quan..│  ← không che
                                      └────────┘
```

Tranh vẽ tay là thứ khách hàng đầu tư nhiều nhất — che mất là mất giá trị chính.

### Cỡ NPC — đọc `artwork_scale`, không dùng một cỡ chung

CMS PHẦN 12 đo được các khối nhà trên tranh mẫu chênh nhau **hơn 5 lần** (34 px đến 183 px).
Nên NPC phải scale theo `npc.artwork_scale` (CMS PHẦN 15 mục **g**):

```text
NPC cạnh tháp cao          cỡ lớn hơn
NPC cạnh nhà thấp          cỡ nhỏ hơn
Cùng một cỡ cho tất cả  →  sai tỉ lệ thấy rõ ngay
```

⚠ **Cần chốt: NPC scale THEO ZOOM hay giữ cỡ màn hình?** Hai hành vi trái nhau:

```text
Scale theo zoom (như phần của tranh)     Giữ cỡ màn hình (như marker)
─────────────────────────────────────────────────────────────────────
zoom ra → NPC nhỏ tí, khó thấy           zoom nào cũng thấy rõ, bấm được
hoà vào tranh, đẹp                        nổi lên trên tranh, dễ dùng
```

Chưa có tài liệu nào nói rõ. Đề xuất: **giữ cỡ màn hình nhưng có ngưỡng** — dưới một mức
zoom thì ẩn NPC đi, hiện cụm số lượng, để không rối. Cần xác nhận với thiết kế.

### Vùng topic + ảnh phủ

CMS PHẦN 9 lưu `topic.display_area` (vùng gốc) và `topic.overlay_corners` (4 góc cho
Mapbox). App dùng:

```text
overlay_corners   →  đặt ảnh phủ topic lên map (Mapbox chỉ nhận 4 góc)
display_area      →  KHÔNG dùng để render, chỉ CMS dùng để admin sửa lại vùng
overlay_opacity   →  độ mờ ảnh phủ
```

⚠ Vùng topic **chỉ để hiển thị và lọc POI** — không liên quan tải offline (đơn vị offline là
POI, xem PHẦN 9b) và không liên quan geofence.

### Ràng buộc isometric — hệ quả phía app

CMS PHẦN 12 chốt quy ước *"mốc luôn chấm ở CHÂN công trình"*. Phía app, hệ quả là:

```text
Pin POI / NPC vẽ ở CHÂN công trình trên tranh, không vẽ ở đỉnh mái.
Nếu vẽ ở đỉnh: lệch 14-75 m so với vị trí thực địa (số đo CMS PHẦN 12)
               — vượt cả bán kính tương tác 25 m.
```

Nghĩa là marker phải neo **đáy** (anchor bottom), không neo tâm — giống cách pin bản đồ
thông thường neo mũi nhọn xuống mặt đất.

---

## PHẦN 7 — STORY MODE: AUDIO ⇄ WEBTOON, THỨ TỰ & CHẠY KHI TẮT MÀN HÌNH

```text
                    ┌─── STORY SHEET (hiện tại) ─────────┐
                    │                                    │
         ┌──────────┴───────────┐            ┌────────────┴────────────┐
         │  Audio narration     │            │  Webtoon (cuộn dọc)     │
         │  đi bộ / tay bận /   │            │  ngồi nghỉ / cầm máy /  │
         │  đeo tai nghe        │            │  đọc khung truyện       │
         └──────────────────────┘            └─────────────────────────┘

   Nhiều lớp nội dung trong 1 NPC/POI hiển thị theo field `order`
   (xem CMS `cms-text-diagram.md` PHẦN 6 — content_block.order)

   Loại nội dung      Phát được khi tắt màn hình?    Ghi chú
   ──────────────────────────────────────────────────────────────
   Audio narration            ✓                       tai nghe vẫn nghe
   Nhạc nền                   ✓
   Text                       ✗                       phải đọc
   Webtoon                    ✗                       phải xem
   Video                      ✗                       phải xem
```

⚠ Field `playable_screen_off` là dữ liệu CMS nhập (nội dung ở CMS PHẦN 6; đề xuất schema ở
CMS PHẦN 15 mục **f**) — phía app chỉ
**đọc** field này để quyết định: khi user cất máy vào túi, tự bỏ qua lớp không nghe được
và phát tiếp lớp audio kế tiếp, thay vì dừng im lặng giữa chừng.

Đây cũng chính là cơ chế dùng lại ở PHẦN 5 (ngoại lệ "đang nghe audio thì không cắt") —
cả hai chỗ đều dựa vào việc app biết lớp nội dung hiện tại có phải audio hay không.

---

## PHẦN 8 — HÀNH TRÌNH / "ĐÃ KHÁM PHÁ"

```text
Hiện tại: app đã lưu danh sách NPC từng mở story, mới nhất lên đầu, khử trùng lặp,
hiển thị qua tab Hành Trình trên màn bản đồ.

Đề xuất — chưa có: đồng bộ server:
   Complete story ──▶ Sync progress (ẩn danh hoặc theo tài khoản)
                          │
                          ▼
                   chuyển NPC vào "Đã khám phá"
                          │
                          ▼
   Publish lại nội dung (xem CMS PHẦN 10):
       → app GỢI Ý "có bản cập nhật", user tự bấm mới tải
       → KHÔNG tự tải đè
       → KHÔNG reset trạng thái đã hoàn thành ("xong là xong")
```

⚠ Nguyên tắc "xong là xong" ở CMS PHẦN 10 áp trực tiếp vào đây: publish lại một POI không
được xoá NPC đó khỏi "Đã khám phá" của user đã hoàn thành trước đó.

⚠ **Hidden Thread / Series hoàn toàn vắng mặt ở màn này.** `cms-text-diagram.md` màn 12
quản lý Hidden Thread/Series như nội dung cấp cao hơn NPC đơn lẻ ("có thể link tới
NPC/Story/POI khác — dạng series"), nhưng "Hành Trình / Đã khám phá" ở đây chỉ lưu danh
sách NPC. Đề xuất xử lý bên dưới.

### Đề xuất xử lý Hidden Thread / Series phía app

```text
┌─── POPUP MỞ KHOÁ BÍ MẬT (Hidden Thread) ─────────────────────┐
│                                                              │
│                    🔒 → 🔓                                   │  ← hiệu ứng chuyển khoá,
│                                                              │    phát khi đủ điều kiện
│   Bạn đã mở khoá bí mật:                                     │
│   "[tên Hidden Thread]"                                      │  ← tên nhập ở CMS màn 12
│                                                              │
│                [ Xem ngay ]                                  │  ← CTA, mở nội dung
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─── HÀNH TRÌNH / ĐÃ KHÁM PHÁ ─────────────────────────────────┐
│                                                              │
│   🔓  [tên Hidden Thread]              Đã mở         ✓       │  ← mục riêng, tách khỏi
│                                                              │    danh sách NPC
│   📖  [tên Series]        [số đã xong]/[tổng]  ▓▓▓░░         │  ← mục riêng, có thanh
│                                                              │    tiến trình
│   👤  [tên NPC]                         Đã khám phá  ✓       │  ← danh sách NPC, giữ
│   👤  [tên NPC]                         Đã khám phá  ✓       │    nguyên như hiện tại
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Lý do tách hai hành vi dù CMS dùng chung một màn nhập liệu (màn 12): về phía trải nghiệm
user, "bí mật ẩn cho tới khi đủ điều kiện" và "chuỗi hiện sẵn, đi dần từng bước" là hai
cảm giác khác nhau — ẩn tạo bất ngờ, hiện sẵn tạo động lực hoàn thành. CMS chỉ cần thêm
một lựa chọn đơn giản (ẩn/hiện) khi nhập liệu để phân biệt hai hành vi này ở phía app.

Nếu Hidden Thread có toạ độ riêng (theo đề xuất `cms-text-diagram.md` PHẦN 14 câu 1, cho
phép để trống), marker của nó dùng lại đúng cơ chế bán kính/vùng như POI bình thường
(PHẦN 6) — chỉ khác là ẩn trên map cho tới khi điều kiện tiên quyết được thoả.

---

## PHẦN 9 — GEOFENCE BACKGROUND & MÀN XIN QUYỀN GENERIC (đề xuất mở rộng)

### Bài toán

Tóm tắt từ thảo luận nội bộ (2026-07-27): *"Giải pháp cho user cất điện thoại vào túi vẫn
nhận được thông báo NPC, và các đánh đổi đi kèm (quyền location Always, hao pin, giới hạn
của iOS) để cân nhắc scope."*

```text
User cất máy vào túi, màn hình tắt
          │
          ▼
   App KHÔNG chạy foreground tracking nữa
          │
          ▼
   Cần quyền location "Always" (không chỉ "While Using")
          │
          ├── iOS: ĐÚNG 20 geofence region cùng lúc — giới hạn CỨNG,
          │        không có cách xin nới. Phải đăng ký động 20 POI gần
          │        user nhất (đây cũng là cách Apple khuyến nghị).
          │        Hệ điều hành còn throttle tần suất callback.
          ├── Android: KHÔNG phải "ít giới hạn hơn" — xem mục dưới,
          │        đây mới là nền tảng khó hơn trong thực tế.
          └── Cả hai: hao pin đáng kể nếu track GPS liên tục thay vì dùng
                geofence event (nên ưu tiên geofence, không polling GPS)
```

### iOS — hai cái bẫy API phải biết TRƯỚC khi code

```text
1. CLCircularRegion đã DEPRECATED
   → iOS 17+ dùng CLMonitor

2. Từ iOS 18 PHẢI khởi tạo CLServiceSession
   → không có thì background geofence IM LẶNG KHÔNG CHẠY
   → không báo lỗi, không crash, chỉ là không có event nào về

3. Region monitoring cũng NGỪNG hoạt động nếu user tắt Background App Refresh
   → app cần tự phát hiện và thông báo cho user
```

Hai mục đầu nếu không biết trước rất dễ mất thời gian debug — code trông đúng, quyền đã
cấp, mà không có event nào về.

Nguồn: https://radar.com/blog/limitations-of-ios-geofencing
Nguồn: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html

### Android — nền tảng khó hơn iOS ở khoản này

Không phải "ít giới hạn hơn". Vấn đề không nằm ở API mà ở **từng hãng tự kill background**:

```text
Hãng            Việc user PHẢI tự làm                        Ghi chú
────────────────────────────────────────────────────────────────────────────
Xiaomi          bật "Autostart" nằm trong app Security       rất khó tìm
Oppo            lock app — nhưng CHỈ cho lock 5 app          hết slot là hết
Vivo            tương tự, nhiều lớp cài đặt                  mỗi bản ROM một khác
```

Ba điểm khiến chuyện này khó hơn giới hạn 20 region của iOS:

```text
· App KHÔNG TỰ BẬT ĐƯỢC các toggle này — chỉ user bật tay
· Các setting này thường BỊ RESET sau khi user update hệ điều hành
· Emulator dùng Android gốc nên KHÔNG thấy được — phải test máy thật từng hãng
```

→ Nếu làm background geofence thì cần thêm **một màn hướng dẫn user bật toggle theo hãng**,
không thì tính năng im lặng không chạy mà user không hiểu tại sao. Màn này dùng lại được
component xin quyền generic ở mục dưới.

Nguồn: https://dontkillmyapp.com/xiaomi · https://dontkillmyapp.com/vivo

### Nguyên tắc UX

Trích thảo luận nội bộ (2026-07-27): *"Phần này làm sao để hỗ trợ một cách tự nhiên là
được. Còn tất nhiên, phân quyền hay mã PIN là vấn đề của người dùng... Quan trọng là làm
sao để màn hình báo quyền nó generic. Tức là làm cách nào đó để người dùng biết được họ
đang thiếu cái gì để thực hiện công việc."*

Nghĩa là: **không** thiết kế riêng từng popup cho từng loại quyền (location Always,
notification, v.v.) — thiết kế **một** màn/panel generic, tham số hoá theo quyền đang
thiếu:

```text
┌─── MÀN XIN QUYỀN GENERIC ──────────────────────────────────┐
│                                                              │
│   Để [nhận thông báo khi có NPC gần bạn dù màn hình tắt]    │  ← câu mô tả tính
│   bạn cần cấp quyền [Vị trí - Luôn cho phép]                │    năng + tên quyền
│                                                              │    là THAM SỐ, không
│   [Mở Cài đặt]              [Bỏ qua]                        │    hard-code từng case
│                                                              │
└──────────────────────────────────────────────────────────────┘

   Tham số hoá theo:
     feature_description  — "nhận thông báo khi có NPC gần bạn dù màn hình tắt"
     permission_name      — "Vị trí - Luôn cho phép" / "Thông báo" / ...
     settings_deeplink     — mở đúng trang Settings tương ứng quyền đó
```

Cùng một component này dùng lại được cho **mọi** quyền thiếu trong tương lai (camera cho
AR sau này, microphone, v.v.) — không phải dựng lại UI mỗi lần thêm quyền mới.

⚠ Đây là phần cần quyết định **scope** trước khi thiết kế chi tiết (câu hỏi đặt ra trong
thảo luận để cân nhắc, chưa chốt có làm ở bản Pro hay để Phase sau) — xem PHẦN 10.

---

## PHẦN 9b — OFFLINE: TẢI VÀ DÙNG GÓI POI

Technical Design §5 là mục 🔴 P0 *"Offline Architecture"*, với nguyên tắc số 1 của cả dự án:
*"App phải dùng được khi mất mạng. Server là nơi đồng bộ, không phải nơi phụ thuộc runtime."*
Đây là điều kiện để app dùng được ngoài đường, nên phải có trong luồng chính.

### Đơn vị offline = POI (đã chốt)

```text
Technical Design dòng 18:
   "Đơn vị offline = POI (đã chốt). Không chia nhỏ tiến độ tải bên trong 1 POI.
    Một POI tải về là trọn gói (map tile + media + content nodes)."
```

Hệ quả cho UI: thanh tiến trình ở **cấp POI**, không có "đã tải 3/5 audio của POI này".
Một POI hoặc `ready`, hoặc chưa — không có trạng thái nửa vời khi dùng.

### Hai cỡ gói, user tự chọn

```text
Gói            Gồm gì                            Cỡ        Dùng khi
──────────────────────────────────────────────────────────────────────────────
Full           audio + webtoon/video + tiles     ~150 MB   trải nghiệm hình ảnh
Chỉ audio      audio + tiles + text              ~20 MB    vừa đi vừa nghe,
                                                            tiết kiệm pin/dung lượng
```

Chênh nhau **hơn 7 lần** — nên lựa chọn này phải hiện rõ lúc tải, không vùi trong cài đặt.

### Luồng tải

```text
┌─── POI: Ô Quan Chưởng ───────────────────────────────────┐
│                                                          │
│   ◉ Gói đầy đủ      ~150 MB   audio + truyện tranh       │
│   ○ Chỉ audio        ~20 MB   nghe khi đi bộ             │
│                                                          │
│   [ Tải về ]                                             │
│                                                          │
│   ── hoặc khi đang tải ──                                │
│   ▓▓▓▓▓▓▓▓░░░░░░  62 MB / 150 MB     [Tạm dừng]          │
│                                                          │
│   ── hoặc khi đã xong ──                                 │
│   ✓ Đã tải · dùng được khi mất mạng   [Xoá gói]          │
└──────────────────────────────────────────────────────────┘
```

Ba yêu cầu kỹ thuật kèm theo, đều từ Technical Design §5:

```text
· Resume được       gói 150 MB tải giữa đường mất mạng là chuyện thường
· Verify checksum   từng asset, chỉ đánh dấu ready khi ĐỦ — không ready nửa vời
· Map tiles         Mapbox Offline Tile Pack, mỗi POI = 1 region (bbox + zoom 11-19)
```

### Trạng thái POI trên bản đồ

```text
Trạng thái        Trên map              Mất mạng thì
─────────────────────────────────────────────────────────────────
chưa tải          pin mờ                không mở được nội dung
đang tải          pin + vòng tiến trình  chưa mở được
ready             pin đầy màu           mở bình thường
```

⚠ **Chế độ tập trung khi mất mạng** (Technical Design §5): khi không có mạng, UI chỉ
highlight POI đã `ready`, ẩn hoặc làm mờ các tính năng cần mạng. Không để user bấm vào rồi
mới báo lỗi.

### Cập nhật nội dung — không tự tải đè

Đây là chỗ nối với CMS PHẦN 10, nhắc lại vì dễ làm sai:

```text
Admin publish lại POI
        │
        ▼
app GỢI Ý "có bản cập nhật"     ◀ KHÔNG tự tải đè
        │
        ├── user bấm cập nhật ──▶ tải bản mới
        └── user bỏ qua       ──▶ vẫn dùng bản cũ đã tải, không hỏng
        
Trong MỌI trường hợp: KHÔNG reset trạng thái đã hoàn thành ("xong là xong")
```

### Quyền truy cập khi offline

```text
Technical Design §5 + §11:
   entitlement snapshot tải về local
   → khi offline vẫn mở được content đã có quyền
   → server là nơi CẤP quyền, local là nơi ENFORCE lúc offline
```

Nghĩa là app không được hỏi server mỗi lần mở nội dung — sẽ chết khi mất mạng.

### Hai rủi ro chưa có lời giải

```text
1. Mapbox giới hạn số tile pack mỗi user (mặc định 750)
   → 50 POI x nhiều vùng có thể chạm trần. Nới được nhưng CÓ THỂ PHÁT SINH PHÍ.
   → cần kiểm tra sớm với gói Mapbox đang dùng.

2. Ngưỡng dung lượng tối đa và chính sách dọn dẹp CHƯA CHỐT
   → Technical Design §16 câu Q5 vẫn để mở, đề xuất "cho user thấy dung lượng
     đã dùng + tự ghim POI".
   → 10 POI gói Full = 1.5 GB. Máy 64 GB gần đầy sẽ tải lỗi.
```

---

## PHẦN 10 — TESTING: SIMULATOR VS THỰC ĐỊA

Tóm tắt từ thảo luận nội bộ (2026-07-27): *"Áp dụng Simulator để test tự động các logic
phức tạp, nhưng vẫn sẽ chốt đi thực địa để bắt các lỗi rủi ro cao (nhiễu sóng, hao pin, độ
trễ GPS)."* Cũng được xác nhận thêm cùng ngày: *"đối với người dùng thì simulator có GPS
simulator, nên có thể test ổn."*

```text
                    CÁI GÌ TEST ĐƯỢC BẰNG SIMULATOR (Dev panel / GPS giả lập)
──────────────────────────────────────────────────────────────────────────────
✓  Logic vào/ra bán kính NPC (hysteresis, thời gian đứng)
✓  Máy trạng thái 4 điều kiện reset Fake GPS (PHẦN 5) — set thời gian, toạ độ giả
✓  Chuyển chế độ audio ⇄ webtoon
✓  Đồng bộ progress / "Đã khám phá"
✓  Giới hạn kéo 300m (PHẦN 4)

                    CHỈ BẮT ĐƯỢC BẰNG THỰC ĐỊA
──────────────────────────────────────────────────────────────────────────────
✗  Nhiễu sóng GPS thật trong phố cổ (nhà cao tầng, ngõ hẹp)
✗  Hao pin thật khi chạy geofence/background dài giờ
✗  Độ trễ cập nhật GPS của từng dòng máy thật (iOS vs Android khác nhau)
✗  Hành vi throttle geofence event của OS khi app ở nền (PHẦN 9)
```

**Kết luận cho kế hoạch test:** dùng simulator để test **tự động, lặp lại được** cho toàn
bộ máy trạng thái Fake GPS — vì đây là logic thuần, không phụ thuộc phần cứng. Dành đi
thực địa cho đúng 4 hạng mục ở nửa dưới bảng, không lặp lại việc simulator đã phủ được.

---

## PHẦN 11 — CÁC CON SỐ ĐÃ CHỐT / ĐỀ XUẤT (phía App)

```text
                                              GIÁ TRỊ      TRẠNG THÁI
────────────────────────────────────────────────────────────────────────
Bán kính "trong tầm" NPC (proximity)          20 m         Hiện tại
Giới hạn kéo Fake GPS tối đa                  300 m        Đề xuất — chốt 27/7
Bán kính coi "đã tới nơi" (tắt Fake GPS)       50 m         Đề xuất — chốt 27/7
Thời gian hết hạn tự reset Fake GPS            15 phút      Đề xuất — chốt 27/7
Buffer giữ vị trí trước khi reset theo GPS      60 giây      Đề xuất — chốt 27/7
tốt trở lại
────────────────────────────────────────────────────────────────────────
Gói offline đầy đủ (PHẦN 9b)                  ~150 MB      Technical Design §5
Gói chỉ audio (PHẦN 9b)                        ~20 MB      Technical Design §5
Dải zoom offline                                11-19       cấu hình theo city
Trần tile pack Mapbox mỗi user                  750         RỦI RO — xem PHẦN 9b
Ngôn ngữ · dự phòng khi thiếu bản dịch       vi/en/zh · vi  PHẦN 1
```

⚠ Bốn số ở nhóm dưới lấy từ Technical Design / CMS, **không phải app tự quyết** — app chỉ
đọc và tuân theo.

⚠ Đối chiếu với `cms-text-diagram.md` PHẦN 11 (phía CMS): bán kính vào 25m / ra 35m /
đứng 3 giây là **cấu hình theo từng POI do admin nhập**, khác với 20m cố định hiện có phía
app. Khi CMS-side triển khai xong, app phải đổi từ hằng số sang đọc cấu hình theo POI (xem
PHẦN 6).

---

## PHẦN 12 — CÂU HỎI CÒN LẠI

```text
1. Popup thông báo "đã trả về GPS thật" hiện dạng gì — banner nhẹ trên map,
   hay dialog chặn thao tác? (thảo luận mới ghi "popup thông báo nhẹ",
   chưa chốt hình thức)

2. Geofence background (PHẦN 9) có nằm trong scope Final Pro hay để Phase sau?
   → phụ thuộc quyết định về đánh đổi pin/quyền Always, chưa có câu trả lời
     trực tiếp, chỉ mới chốt hướng UX generic.

3. Màn xin quyền generic (PHẦN 9) áp dụng cho quyền nào ngoài Location?
   Notification chắc chắn cần (để bắn thông báo NPC khi tắt màn hình) —
   còn microphone/camera thì chưa có tính năng nào cần tới ở bản hiện tại.

4. Khi Fake GPS đang bật mà user thực sự di chuyển (GPS thật đổi), ai thắng?
   → theo máy trạng thái PHẦN 5, GPS thật vào bán kính 50m mới tắt Fake GPS,
     nghĩa là GIỮA khoảng đó app vẫn ưu tiên vị trí đã kéo, không phải GPS
     thật — cần xác nhận đây đúng là ý đồ, không phải khe hở logic.

5. Hidden Thread / Series app-side: user gặp bằng cách nào, và "Hành Trình / Đã khám
   phá" có cần mục riêng cho Series không hay gộp chung NPC?
   → Đề xuất: xem PHẦN 8 (ẩn + mở khoá cho Hidden Thread, hiện + thanh tiến trình cho
     Series). Vẫn cần CMS xác nhận có thêm được lựa chọn ẩn/hiện khi nhập liệu không.

6. Ngôn ngữ hiển thị chọn ở đâu trong app, và "ngôn ngữ dự phòng" cụ thể là gì?
   → Đề xuất: xem PHẦN 1 (icon 🌐 trên Home, mặc định theo locale máy hoặc "vi", fallback
     dịch thiếu luôn về "vi"). Vẫn cần xác nhận đây là hướng UX product muốn.

7. POI dạng vẽ vùng dài hơn 300m (vd. Văn Miếu ~350m) — Fake GPS có cần nới giới hạn kéo
   riêng cho polygon lớn?
   → Đề xuất: xem PHẦN 4 (giới hạn kéo tính theo kích thước thật của vùng đã vẽ + biên
     độ an toàn, thay vì hằng số cứng 300m cho mọi POI).

8. NPC trên tranh scale THEO ZOOM hay giữ cỡ màn hình? (PHẦN 6b)
   → hai hành vi trái nhau: theo zoom thì hoà vào tranh nhưng zoom ra là mất hút;
     giữ cỡ màn hình thì luôn bấm được nhưng nổi lên trên tranh
   → Đề xuất: giữ cỡ màn hình + ẩn NPC dưới một mức zoom, hiện cụm số lượng thay thế

9. Trần 750 tile pack của Mapbox mỗi user — gói hiện tại của mình có chạm không? (PHẦN 9b)
   → 50 POI, mỗi POI 1 region. Nới được nhưng CÓ THỂ PHÁT SINH PHÍ.
   → cần kiểm tra sớm, đây là rủi ro chặn tính năng offline

10. Ngưỡng dung lượng offline tối đa + chính sách dọn dẹp? (PHẦN 9b)
    → Technical Design §16 câu Q5 vẫn để mở
    → 10 POI gói đầy đủ = 1.5 GB, máy gần đầy sẽ tải lỗi

11. Kích thước THẬT của khu di tích trên artwork mẫu là bao nhiêu mét? (PHẦN 4)
    → CMS PHẦN 14 câu 3 cũng đang hỏi câu này
    → ảnh hưởng kết luận "300m đủ rộng" ở PHẦN 4 và cỡ NPC mặc định
```

---

## PHẦN 13 — DÙNG FILE NÀY LÀM PROMPT

```text
File này                             →  dùng cho
─────────────────────────────────────────────────────────────────
PHẦN 4, 5 (Fake GPS + máy trạng thái) →  brief dựng phần khó nhất, cần
                                         xem kỹ máy trạng thái trước khi code
PHẦN 3 (luồng chính)                  →  cho design tool hiểu bối cảnh toàn app
PHẦN 9 (geofence + quyền generic)     →  brief phần mở rộng, CẦN chốt scope
                                         trước (xem PHẦN 12, câu 2) rồi mới thiết kế
PHẦN 11 (con số)                      →  ràng buộc, tránh tool tự đổi số
PHẦN 6 (đối chiếu CMS)                →  đọc cùng `cms-text-diagram.md` PHẦN 5 khi
                                         cần biết app phải đổi gì sau khi CMS xong
PHẦN 6b (artwork trên map)            →  BẮT BUỘC dán kèm khi dựng màn 02, và dán
                                         kèm CMS PHẦN 12 (ràng buộc isometric)
PHẦN 9b (offline)                     →  brief màn tải gói + trạng thái POI trên map
PHẦN 12 (câu hỏi)                     →  đánh dấu chỗ đang là giả định, hỏi lại
                                         trước khi lock UI
```

Cách dùng: dán **PHẦN 3 + PHẦN 11 + phần cần dựng**. Dán kèm PHẦN 5 bất cứ khi nào dựng
màn/luồng liên quan tới Fake GPS — máy trạng thái không suy ra được từ mô tả UI đơn thuần.

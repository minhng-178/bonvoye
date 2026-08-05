# CMS BonVoye — Text Diagram toàn hệ thống

> **Mục đích:** để review mức độ chi tiết trước khi thiết kế thật, và dùng lại làm input
> cho design tool. Toàn bộ vẽ bằng ký tự, không cần tool nào để xem.
>
> **Ngày:** 2026-07-29 · **Nguồn:** Final Pro Scope + Technical Design v0.2 + thảo luận 21–29/07
> · artwork mẫu `artwork-mau-tham-chieu.png`

---

## PHẦN 1 — BẢN ĐỒ MÀN HÌNH

```
                          ┌─────────────────┐
                          │   01 Đăng nhập  │
                          └────────┬────────┘
                                   ▼
                          ┌─────────────────┐
                          │  02 Dashboard   │
                          └────────┬────────┘
                                   ▼
        ┌──────────────────────────┴──────────────────────────┐
        │                 SIDEBAR (4 khu vực)                 │
        └─────┬────────────┬────────────┬────────────┬────────┘
              ▼            ▼            ▼            ▼
           ┌─────┐    ┌──────────┐  ┌──────────┐  ┌───────┐
           │ Nội │    │ Đa ngôn  │  │ Partner  │  │Audit +│
           │ dung│    │   ngữ    │  │          │  │Cài đặt│
           └──┬──┘    └──────────┘  └──────────┘  └───────┘
              │          (14)        (13 · 16)      (17)
              ▼
   ┌───────────────── 03 CÂY NỘI DUNG 7 CẤP ──────────────────┐
   │                                                          │
   │  Country ──▶ 04                                          │
   │    └─ City ──▶ 04                                        │
   │        └─ Topic ──▶ 05  (vẽ vùng + ảnh minh hoạ)         │
   │            └─ POI ──▶ 06 · 07 · 08   ◀── TRỌNG TÂM       │
   │                ├─ NPC ──▶ 09                             │
   │                │   └─ Story ──▶ 10 (webtoon editor)      │
   │                └─ Hidden Thread ──▶ 12                   │
   │                                                          │
   └────────────────────────┬─────────────────────────────────┘
                            ▼
                   ┌───────────────────┐
                   │ 15 Publish/Version│
                   └───────────────────┘
```

**Ba màn thuộc POI, vì POI là nơi mọi thứ hội tụ:**

```
   06 Thông tin cơ bản  ─── tab ───  07 Căn artwork  ─── tab ───  08 Panel item
   (toạ độ, bán kính,              (điểm mốc, bảng              (NPC, nhãn,
    hoặc vẽ vùng)                   sai số)                      media)
                                          ▲
                                    CHƯA CHỐT cấp nào — xem PHẦN 4
```

### Danh sách đầy đủ 17 màn

```
STT  MÀN                        VÀO TỪ ĐÂU              GHI CHÚ
═════════════════════════════════════════════════════════════════════════════
01   Đăng nhập                  —                       chuẩn
02   Dashboard                  sau đăng nhập           thống kê + việc cần làm
─────────────────────────────────────────────────────────────────────────────
03   Cây nội dung 7 cấp         sidebar ▸ Nội dung      xương sống điều hướng
04   Country / City             cây ▸ node cấp 1-2      PHẦN 9 · dùng chung 1 màn
05   Topic (vùng + ảnh)         cây ▸ node Topic        PHẦN 10
─────────────────────────────────────────────────────────────────────────────
06   POI — thông tin cơ bản     cây ▸ node POI          PHẦN 5   ◀ tab 1
07   POI — căn artwork          tab trong POI (?)       PHẦN 4   ◀ KHÓ NHẤT
                                CHƯA CHỐT cấp nào               xem đầu PHẦN 4
08   POI — panel item           tab trong POI           PHẦN 6   ◀ tab 3
─────────────────────────────────────────────────────────────────────────────
09   NPC                        cây ▸ node NPC          CRUD + toạ độ
10   Story / webtoon editor     cây ▸ node Story        PHẦN 8
11   Media của story            TRONG màn 10            audio, ảnh, video
                                                        KHÔNG phải khu sidebar
12   Hidden Thread / Series     cây ▸ Hidden Thread     KHÔNG phải khu sidebar
                                                        xem ghi chú bên dưới
13   Quản lý Access Code        sidebar ▸ Partner       tạo code hàng loạt
14   Đa ngôn ngữ                sidebar ▸ Đa ngôn ngữ   trạng thái dịch vi/en/zh
─────────────────────────────────────────────────────────────────────────────
15   Publish / Version          từ mọi node content     PHẦN 11
16   Partner / Campaign         sidebar ▸ Partner       gán code cho đối tác
17   Audit log + Cài đặt        sidebar ▸ Cài đặt       ai sửa gì lúc nào
```

⚠ **Màn 12 dùng chung cho Hidden Thread và Series.** Technical Design §3.1 ghi Hidden
Thread *"có thể link tới NPC/Story/POI khác — dạng series"*, nên hai thứ này cùng một cấu
trúc dữ liệu và dùng chung màn. Nếu tách riêng thì **+1 màn**.

ℹ Con số 17 có thể tăng: **2 quyết định đang treo, mỗi cái +1 màn** — tách Hidden Thread khỏi
Series (ở đây), và tách màn căn artwork ra cấp tranh (PHẦN 4). Độc lập nhau, cả hai thì 19.

---

## PHẦN 2 — MÀN NÀO KHÓ

Chỉ có một màn thật sự khó. Xếp hạng để biết chỗ nào cần đào sâu, chỗ nào là mẫu quen.

```
ĐỘ KHÓ                MÀN                          VÌ SAO
════════════════════════════════════════════════════════════════════════════
█████████████  07 Căn artwork ↔ GPS      Bài toán toán học. Sai thì phát
                                          hiện rất muộn (khi user đã ra
                                          đường). Xem PHẦN 4.
──────────────────────────────────────────────────────────────────────────
██████         06 Vùng tương tác          2 chế độ (bán kính / vẽ vùng),
                                          3 con số chống nhiễu GPS
██████         08 Panel item              2 hệ toạ độ song song, dễ nhầm
█████          10 Webtoon editor          Sắp thứ tự trang, upload hàng loạt
████           05 Vùng topic + ảnh        Cắt ảnh theo vùng ở CMS
──────────────────────────────────────────────────────────────────────────
██             03 Cây 7 cấp               Mẫu quen, chỉ lưu ý POI đa Topic
██             15 Publish/Version         Mẫu quen
█              04·09·11·12·13·14·16·17    CRUD thường
─              01 Đăng nhập · 02 Dashboard  mẫu chuẩn, không xếp hạng
```

**Kết luận:** làm kỹ **07**, làm vừa **06 và 08**, còn lại mẫu quen.

Nguyên tắc: tập trung công sức vào điểm nóng. Các màn CRUD thường có mẫu sẵn, không cần
thiết kế lại từ đầu.

---

## PHẦN 3 — LUỒNG CHÍNH: NHẬP MỘT POI TỪ ĐẦU

Đây là luồng admin làm mỗi ngày. Đo bằng số thao tác vì đó là thứ quyết định UX.

```
BẮT ĐẦU
   │
   ├─▶ [1] Cây nội dung → chọn City → "+ Thêm POI"
   │
   ├─▶ [2] SCREEN 06 — thông tin cơ bản
   │       ├── Nhập tiêu đề (vi/en/zh)
   │       ├── Kéo pin trên bản đồ → có toạ độ GPS
   │       └── Chọn vùng tương tác:
   │             ├─ Bán kính (mặc định) ──▶ xong, 3 số có sẵn
   │             └─ Vẽ vùng (hình dài/hẹp) ──▶ vẽ polygon
   │
   ├─▶ [3] SCREEN 07 — căn artwork          ◀── CHỖ TỐN THỜI GIAN NHẤT
   │       ├── Upload tranh vẽ
   │       ├── Đặt điểm mốc #1: click tranh → click bản đồ
   │       ├── Đặt điểm mốc #2, #3
   │       │     └──▶ ⚠ CẢNH BÁO: "0.0m không phải bằng chứng căn đúng"
   │       ├── Đặt thêm #4, #5
   │       │     └──▶ bảng sai số hiện: #2 lệch 45.1m ⚠ (RMSE 21.0m)
   │       ├── Sửa #2 → RMSE về 6.6m ✓
   │       └── Hệ tự tính 4 góc ảnh cho Mapbox — admin không chấm
   │
   ├─▶ [4] SCREEN 08 — thêm NPC
   │       ├── "+ Thêm NPC" → đặt trên tranh
   │       ├── Hệ GỢI Ý sẵn toạ độ GPS (nhờ phép căn ở [3])
   │       └── Admin xác nhận hoặc kéo lại      ◀── 1 thao tác, không phải 2
   │
   ├─▶ [5] SCREEN 10 — thêm Story
   │       ├── Upload audio narration
   │       └── Upload 20 trang webtoon MỘT LƯỢT, tự sắp theo tên file
   │
   └─▶ [6] SCREEN 15 — Publish
           └── Cảnh báo nếu: thiếu bản dịch │ CHƯA CĂN ARTWORK
   KẾT THÚC
```

**Chỗ đáng chú ý về UX:** bước [4] nếu thiết kế sai thì admin phải đặt toạ độ **2 lần**
cho mỗi NPC (một trên tranh, một trên bản đồ thật). Với 50 POI × 3 NPC = 300 lượt thao
tác thừa. Cơ chế "gợi ý + xác nhận" rút về một nửa.

---

## PHẦN 4 — SCREEN 07 CHI TIẾT (màn khó nhất)

⚠ **CHƯA CHỐT: phép căn thuộc tranh (cấp city) hay thuộc POI?**

Schema đặt `calibration` ở bảng `artwork`, mà `artwork` có `city_id` — không phải `poi_id`.
Thêm nữa `poi.artwork_id` là khoá ngoại N-1, nên **nhiều POI CÓ THỂ dùng chung một tranh và
chung một phép căn**. Schema cho phép, không bắt buộc.

Nếu dùng chung mà để "Căn artwork" làm tab trong POI như mockup dưới đây, admin căn ở POI này
sẽ **đổi luôn phép căn của mọi POI khác cùng tranh** — mà không có gì báo.

→ Cần chốt: **một tranh phủ nhiều POI, hay mỗi POI một tranh riêng?** Chỉ cần xem 1-2 file
artwork thật là trả lời được (PHẦN 15 câu 4).

```
Nếu dùng chung        tách màn căn ra cấp tranh, làm 1 lần
                      tab POI chỉ giữ artwork_position       → +1 màn
Nếu mỗi POI 1 tranh   giữ nguyên mockup hiện tại             → 17 màn
```

Mockup dưới đang vẽ theo hướng **tab trong POI**. Phần toán học (RMSE, 2 cảnh báo, ngưỡng
h/D) không phụ thuộc màn nằm ở cấp nào — giữ nguyên dù chốt cách nào.

### Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  Văn Miếu              [Cơ bản] [★ Căn artwork] [Item]      [Publish]  │
├──────────────────────────────────┬─────────────────────────────────────┤
│  TRANH VẼ (artwork)              │  BẢN ĐỒ THẬT                        │
│  ┌────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │        ①                   │  │  │      ①                        │  │
│  │              ②────╮        │  │  │            ②                  │  │
│  │                   ╰▶ lệch  │  │  │                               │  │
│  │      ③                     │  │  │   ③                           │  │
│  │            ④          ⑤    │  │  │         ④         ⑤           │  │
│  └────────────────────────────┘  │  └───────────────────────────────┘  │
│  Opacity ▓▓▓▓▓▓▓░░░ 70%          │  [Xem tranh phủ lên bản đồ]         │
├──────────────────────────────────┴─────────────────────────────────────┤
│  SAI SỐ CĂN CHỈNH            RMSE: 21.0 m       Xấu nhất: 45.1 m  ⚠    │
│  ────────────────────────────────────────────────────────────────────  │
│   #1  Cổng chính              4.1 m  ✓                                 │
│   #2  Khuê Văn Các           45.1 m  ⚠  ← kiểm tra lại điểm này        │
│   #3  Giếng Thiên Quang       5.8 m  ✓                                 │
│   #4  Nhà Thái Học            7.2 m  ✓                                 │
│   #5  Cổng sau                8.9 m  ✓                                 │
│  ────────────────────────────────────────────────────────────────────  │
│  3 điểm là tối thiểu · 5-6 điểm là khuyến nghị để KIỂM TRA được        │
└────────────────────────────────────────────────────────────────────────┘
```

Mũi tên `②────╮` trên tranh: từ chỗ admin đặt tới chỗ hệ thống dự đoán. Admin nhìn một
cái là thấy mũi tên nào dài bất thường.

ℹ Ví dụ dùng Văn Miếu vì chỉ khu đủ lớn mới có 5-6 mốc rải khắp tranh. PHẦN 6 dùng Ô Quan
Chưởng — cổng ô đơn lẻ, không có 5 mốc như vậy.

### Ba chế độ xem

Cùng một dữ liệu, ba cách nhìn khác nhau. Đây là thứ admin đổi qua lại liên tục nên phải
để nút ở chỗ dễ bấm, không vùi trong menu.

```
┌─ ① RIÊNG ────────────┐  ┌─ ② CÙNG BẢN ĐỒ ──────┐  ┌─ ③ PREVIEW ──────────┐
│                      │  │                      │  │                      │
│   ⌂⌂⌂ tranh ⌂⌂⌂      │  │  ╱▔▔▔▔▔▔▔▔╲ tranh    │  │   ⌂⌂⌂ như trên       │
│   ⌂⌂⌂⌂⌂⌂⌂⌂⌂⌂         │  │ ╱ ▒▒ đè lên ▒╲       │  │   ⌂⌂ điện thoại      │
│   ⌂⌂⌂⌂⌂⌂⌂⌂⌂⌂         │  │╱  ▒ bản đồ ▒▒ ╲      │  │      👤 NPC          │
│                      │  │  đường phố thật      │  │   ẩn hết mốc + lưới  │
│ tranh nguyên khổ     │  │                      │  │                      │
│ KHÔNG có bản đồ      │  │ opacity 0 ─── 100%   │  │ [📱 iPhone ▾]        │
│ zoom/pan độc lập     │  │ zoom theo bản đồ     │  │                      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
   để CHẤM chính xác        để KIỂM tranh có nằm       để XEM user thấy gì
                            đúng vùng đất của nó
```

**Vì sao chế độ ① phải zoom độc lập:** chấm mốc cần zoom sâu vào chi tiết tranh (mái, cổng,
gốc cây). Nếu buộc zoom chung với bản đồ thì zoom sâu vào tranh sẽ kéo bản đồ zoom theo,
mất ngữ cảnh xung quanh. Hai khung phải rời nhau khi đang chấm.

**Chế độ ② là chỗ phát hiện lỗi căn:** tranh phủ lên bản đồ mà lệch ra ngoài khu đất, hoặc
xoay lệch, thì thấy ngay — không cần đọc bảng sai số.

### Lớp hiển thị (layer)

Màn này chồng nhiều thứ lên nhau. Không có công tắc ẩn/hiện thì rối không làm việc được.

```
┌─── LỚP HIỂN THỊ ────────────────────────┐
│  ☑ Tranh vẽ            opacity  70%     │
│  ☑ Bản đồ thật         opacity 100%     │
│  ────────────────────────────────────   │
│  ☐ Điểm mốc căn (5)    ◀ mặc định TẮT   │
│  ☑ Pin POI                              │
│  ☑ NPC (3)                              │
│  ☑ Nhãn di tích (1)                     │
│  ☐ Vùng tương tác                       │
│  ☐ Lưới toạ độ                          │
│  ────────────────────────────────────   │
│  [Chỉ hiện lớp đang sửa]                │
└─────────────────────────────────────────┘
```

**Điểm mốc mặc định TẮT.** Căn xong thì hiếm khi cần xem lại, mà 5-6 mốc kèm mũi tên sai số
che kín tranh. Chỉ bật khi vào tab căn artwork.

Nút *"Chỉ hiện lớp đang sửa"* — bấm một cái tắt hết lớp khác. Khi đặt NPC giữa vùng đông
đúc thì đây là nút cứu.

### Preview: giống được gì, không giống được gì

Preview trả lời *"trông thế nào"*, **không** trả lời *"user có mở được không"*.

```
GIỐNG ĐƯỢC (tĩnh)                KHÔNG GIỐNG ĐƯỢC (động)
──────────────────────────────────────────────────────────────────
vị trí NPC trên tranh            GPS nhiễu 15-50 m trong phố
tỉ lệ, cỡ NPC                    user zoom mức khác
thứ tự lớp, cái gì che cái gì    màn hình cỡ khác
nhãn có che tranh hay không      có đứng đủ 3 giây hay không
opacity                          tín hiệu GPS chỗ đó tốt hay tệ
```

⚠ Preview trông càng giống thiết bị thật thì admin càng dễ tin là đã kiểm tra xong. Nên
trong preview phải có dòng nhắc:

```
┌──────────────────────────────────────────────────────────┐
│ ℹ Đây là bản xem trước phần HÌNH ẢNH.                    │
│   Việc user có mở được nội dung hay không còn phụ thuộc  │
│   GPS thực địa — phải kiểm bằng simulator hoặc đi thử.   │
└──────────────────────────────────────────────────────────┘
```

### HAI bộ toạ độ khác nhau — đừng gộp làm một

Chỗ này dễ lẫn nhất của cả màn. Có **hai** việc cùng cần toạ độ, số lượng điểm khác nhau:

```
              ① 4 GÓC ẢNH                    ② ĐIỂM MỐC CĂN
        ───────────────────────────    ───────────────────────────
Để làm  dán ảnh lên Mapbox            đổi toạ độ tranh ↔ GPS
Số điểm ĐÚNG 4, không hơn kém         ≥3, nên 5-6
Ai nhập HỆ TỰ TÍNH, admin không chấm  ADMIN chấm tay
Ở đâu   4 góc khung ảnh               mốc nhận biết được: cổng,
                                       gốc cây, góc tường
Vì sao  Mapbox image source chỉ       cần điểm thừa để ĐO sai số
        nhận 4 cặp lon/lat, thứ
        tự kim đồng hồ từ trên-trái
Dùng cho  hiển thị tranh trên map     đặt NPC, geofence, chỉ đường
Sai thì   tranh lệch chỗ, thấy ngay   user tới sai chỗ, phát hiện
                                       rất muộn
```

Minh hoạ:

```
   ┌①────────────────────②┐   ← 4 GÓC: hệ tự tính, admin không chấm
   │                      │
   │   ⌂ ▲cổng            │   ← ĐIỂM MỐC: admin chấm ở vật nhận biết được
   │        ⌂⌂⌂           │      (▲ = mốc, rải khắp tranh)
   │    ▲       ⌂⌂  ▲     │
   │       ⌂⌂⌂⌂⌂          │
   │  ▲            ▲      │
   └④────────────────────③┘
```

**Vì sao KHÔNG bắt admin chấm 4 góc:**

```
4 góc khung tranh thường là chỗ TRỐNG — bãi cỏ, mặt nước, mép giấy.
Không có vật gì để đối chiếu trên bản đồ thật.
→ admin chỉ đoán, mà với đúng 3 điểm sai số luôn hiện 0.0m nên không ai biết đã đoán sai.
```

→ Nên **hệ tự tính 4 góc từ điểm mốc**, admin không chạm vào:

```
Admin chấm 5-6 điểm mốc BÊN TRONG tranh
        │
        ├──▶ bảng sai số (RMSE, xấu nhất)        ← để admin tự kiểm
        └──▶ hệ áp phép căn vào 4 pixel góc ảnh   ← (0,0) (W,0) (W,H) (0,H)
                    │                                đều biết sẵn
                    └──▶ ra 4 cặp lon/lat cho Mapbox
                             │
                             └── vẫn cho kéo tay nếu ảnh phủ trông lệch
```

Ba lý do cách này chắc chắn dùng được:

```
· Góc ảnh là pixel BIẾT SẴN — (0,0), (W,0), (W,H), (0,H) — chỉ việc áp phép căn
· Affine biến hình chữ nhật thành hình bình hành; Mapbox nhận tứ giác bất kỳ nên hợp lệ
· Phép nghịch đảo tồn tại khi det ≠ 0 — chính là thứ ngưỡng h/D bên dưới đã canh,
  không cần thêm điều kiện mới
```

Bớt đúng chỗ admin không có cách làm đúng: chấm mốc ở cổng chùa thì làm được, chấm góc ảnh
giữa bãi cỏ thì chỉ đoán.

⚠ **Giới hạn của 4 góc với tranh vẽ tay:** 4 góc chỉ tạo được **một phép biến đổi phẳng cho
cả ảnh**. Tranh vẽ tay thì tỉ lệ mỗi chỗ một khác, đường thì bẻ cong, hướng thì lệch — một
phép biến đổi duy nhất không kham nổi.

```
Cách xử lý           Được gì                       Mất gì
──────────────────────────────────────────────────────────────────────
4 góc (làm ngay)     đơn giản, Mapbox hỗ trợ sẵn   không sửa được biến
                                                    dạng cục bộ
Cắt tranh thành      khớp sát hơn từng vùng        nhiều source, có
lưới nhiều ô                                       đường ghép
Warp sẵn ở CMS,      khớp tốt nhất                 phải xử lý ảnh phía
xuất ra raster tile                                 server, nặng hơn
```

→ Đề xuất: **M1 làm 4 góc**, đo **lệch ảnh phủ** thật trên 2-3 POI. Nếu lệch quá bán kính
25m thì mới tính tới warp. Không làm warp ngay từ đầu vì chưa biết có cần.

Nguồn: [Mapbox Sources](https://docs.mapbox.com/mapbox-gl-js/api/sources/) — `coordinates`
nhận đúng 4 cặp `[lon, lat]`, thứ tự kim đồng hồ từ góc trên-trái.

### HAI loại sai số — đừng gọi chung một tên

```
RMSE điểm mốc    sai số ĐỔI TOẠ ĐỘ, từ 5-6 mốc  → hiện trong bảng sai số
Lệch ảnh phủ     sai số DÁN ẢNH, từ 4 góc       → phải tự mắt so ở chế độ ②
```

⚠ **Hai số này độc lập, không suy ra nhau.** RMSE 5m mà ảnh phủ lệch 30m là có thể — toạ độ
đúng nhưng tranh dán sai chỗ, và ngược lại. Nên lúc test phải nói rõ đang báo con số nào.

### Vì sao dùng RMSE, không dùng trung bình cộng

```
Cùng 5 điểm trên (4.1 · 45.1 · 5.8 · 7.2 · 8.9):

   Trung bình cộng   14.2 m      ← 1 điểm sai bị 4 điểm tốt pha loãng
   RMSE              21.0 m      ← bị kéo vọt lên, ĐÚNG cái ta cần thấy

Sau khi admin sửa #2 từ 45.1 m về 6.2 m:

   RMSE   21.0 m ──────▶ 6.6 m       Xấu nhất  45.1 m ──────▶ 8.9 m
```

RMSE = `√(Σd²/n)`. Bình phương làm điểm lệch nhiều nặng hơn hẳn, nên **một điểm đặt sai
không bị các điểm tốt che đi**. Nếu dùng trung bình cộng, 50 POI mỗi POI lệch một điểm thì
tất cả đều hiện con số "trông ổn".

Cột **Xấu nhất** phải luôn hiện cạnh RMSE — RMSE cho biết *tổng thể*, xấu nhất cho biết
*điểm nào cần sửa*.

### Máy trạng thái của màn này

```
       ┌──────────────────┐
       │ CHƯA CÓ TRANH    │  chỉ hiện ô kéo-thả file
       │ (trạng thái đầu) │  khung bản đồ mờ đi, chưa cho click
       └────────┬─────────┘
                │ upload artwork
                ▼
       ┌──────────────┐
       │  0 điểm mốc  │  "Hãy đặt điểm mốc đầu tiên"
       └──────┬───────┘
              │ đặt 1-2 điểm
              ▼
       ┌──────────────┐
       │  1-2 điểm    │  "Chưa đủ để tính. Cần tối thiểu 3 điểm."
       └──────┬───────┘
              │ đặt điểm thứ 3
              ▼
    ┌─────────────────────┐
    │   ĐÚNG 3 ĐIỂM       │
    │   sai số = 0.0m     │
    └─────────┬───────────┘
              ▼
    ┌─────────────────────┐
    │ ⚠ CẢNH BÁO 1        │  "0.0m KHÔNG phải bằng chứng căn đúng"
    │   (luôn hiện)       │
    └─────────┬───────────┘
              │ đặt thêm điểm
              ▼
    ┌─────────────────────┐
    │  ≥4 điểm            │  sai số bắt đầu đo được ✓
    └─────────────────────┘

    ─────────────────────────────────────────────────────────────────
    KIỂM TRA HÌNH DẠNG — chạy SONG SONG, độc lập với số điểm mốc
    ─────────────────────────────────────────────────────────────────

              tính h/D  (xem mục "Con số" bên dưới)
                   │
       ┌───────────┼───────────┬──────────────┬─────────────┐
       ▼           ▼           ▼              ▼             ▼
   ┌────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐
   │ ≥ 20%  │ │ 10-20% │ │  2-10%   │ │  0.5-2%   │ │  < 0.5%   │
   │ im     │ │ gợi ý  │ │ ⚠ vàng   │ │ ⚠ đỏ      │ │ ✖ CHẶN    │
   │ lặng   │ │ nhẹ    │ │ hiện số  │ │ đề nghị   │ │ publish   │
   │        │ │        │ │ khuếch   │ │ sửa       │ │           │
   │        │ │        │ │ đại      │ │           │ │           │
   └────────┘ └────────┘ └──────────┘ └───────────┘ └───────────┘

   Riêng ca det == 0 bắt riêng, thông báo KHÁC:
   ┌──────────────────────────────────────────────────┐
   │ ✖ Điểm mốc #2 và #4 trùng nhau                   │
   │   →  xoá một điểm, hoặc dời ra chỗ khác          │
   └──────────────────────────────────────────────────┘
```

Hai nhánh trên **độc lập nhau**: một POI có thể đủ 6 điểm mốc mà vẫn bị chặn vì cả 6 dồn
gần một đường thẳng. Ngược lại 3 điểm bố trí đẹp thì chỉ bị cảnh báo 1, không bị cảnh báo 2.

### Hai cảnh báo — vì sao bắt buộc

**Cảnh báo 1 — khi đúng 3 điểm:**

```
┌──────────────────────────────────────────────────────────┐
│ ℹ  Sai số đang là 0.0 m ở cả 3 điểm — nhưng đây KHÔNG    │
│    có nghĩa là bạn căn đúng.                             │
│    Với đúng 3 điểm, phép tính luôn khớp hoàn hảo kể cả   │
│    khi bạn đặt sai. Hệ thống không kiểm tra được.        │
│    → Hãy đặt thêm 2-3 điểm nữa.                          │
└──────────────────────────────────────────────────────────┘
```

Cơ sở: phép affine có 6 tham số, mỗi điểm mốc cho 2 phương trình → 3 điểm vừa đủ nghiệm,
không còn dư để đo sai số. Tài liệu ArcGIS: *"With a minimum of three control points, the
mathematical equation used with a first-order transformation can exactly map each raster
point to the target location"* và *"Any more than three control points introduces errors,
or residuals, that are distributed throughout all the control points."*
Nguồn: https://doc.esri.com/en/arcgis-pro/latest/help/data/imagery/overview-of-georeferencing.html

**Cảnh báo 2 — khi điểm mốc dồn gần một đường thẳng:**

```
┌──────────────────────────────────────────────────────────┐
│ ⚠  Các điểm mốc đang dồn quá gần một đường thẳng.        │
│    Cấu hình hiện tại khuếch đại sai số khoảng 25 lần:    │
│    bạn lệch tay 2 m thì POI ở xa có thể lệch tới 50 m —  │
│    vượt bán kính 25 m.                                   │
│    → Đặt thêm 1 điểm lệch hẳn ra khỏi đường đó.          │
└──────────────────────────────────────────────────────────┘
```

### Hiểu cảnh báo này bằng hình

Ba điểm mốc tạo thành một tam giác. **Tam giác càng "dẹt" thì phép căn càng bấp bênh.**

```
   TAM GIÁC BÉO — tốt                  TAM GIÁC DẸT — nguy hiểm

         ③                                    ③
        ╱ ╲                          ①───────────────②
       ╱   ╲                              (①②③ gần như cùng hàng)
      ╱     ╲
   ①─────────②                     Nhấc ③ lên/xuống một chút
                                    → mặt phẳng NGHIÊNG rất mạnh
   Nhấc ③ lên chút                  → toàn bộ POI dịch theo
   → mặt phẳng nghiêng chút
```

Ví dụ cụ thể để thấy vì sao:

```
Tưởng tượng đặt một tấm kính lên 3 cái chân đỡ.

  3 chân xa nhau     →  tấm kính VỮNG. Chân nhúc nhích 1 cm,
                        mặt kính nghiêng không đáng kể.

  3 chân gần 1 hàng  →  tấm kính BẬP BÊNH. Chân giữa nhúc nhích 1 cm,
                        đầu kia của kính vọt lên cả gang tay.

Kính không rơi khỏi chân — nó vẫn tựa trên cả 3 chân. Chỉ là NGHIÊNG
rất mạnh so với một cái nhúc nhích rất nhỏ. Đó mới là chỗ nguy hiểm:
mọi thứ trông vẫn bình thường.

Phép căn artwork chính là tấm kính đó: 3 điểm mốc là 3 chân đỡ,
"mặt kính" là quy tắc đổi từ toạ độ tranh sang GPS.
```

### Con số: khuếch đại = khoảng cách ÷ độ lệch

Đặt tên cho hai đại lượng:

```
   ③  ← điểm thứ ba
   ┊
   ┊ h = điểm ③ lệch khỏi đường ①② bao nhiêu
   ┊
   ①━━━━━━━━━━━━━━━━━━━━━━━━② ← D = khoảng cách giữa ①②
```

Công thức (đã kiểm chứng bằng tính toán, khớp mọi dòng bên dưới):

```
                              D
      khuếch đại  =  ─────────────────
                              h
```

Bảng với `D = 100 m`, admin lệch tay `2 m`:

```
    h        h/D      POI xa lệch    Khuếch đại
  ────────────────────────────────────────────────
   80 m      80%          2.5 m          1.2x      ✓ an toàn
   40 m      40%          5.0 m          2.5x      ✓
   20 m      20%           10 m            5x      ✓ tạm được
   10 m      10%           20 m           10x      ⚠ nhắc nhẹ
    8 m       8%           25 m         12.5x      ⚠ đã bằng radius
    4 m       4%           50 m           25x      ⚠ cảnh báo
    2 m       2%          100 m           50x      ⚠ cảnh báo mạnh
    1 m       1%          200 m          100x      ⚠
```

**Điều đáng chú ý: khuếch đại chỉ phụ thuộc TỈ LỆ `h/D`, không phụ thuộc đơn vị.**

Nghĩa là POI nhỏ hay lớn đều dùng chung một ngưỡng. Ba mốc cách nhau 20m mà lệch 2m
(tỉ lệ 10%) nguy hiểm **y như** ba mốc cách nhau 200m mà lệch 20m. Thuận lợi cho việc
làm: chỉ cần một bộ ngưỡng cho mọi POI.

### Ngưỡng đề xuất

```
   h/D          khuếch đại      CMS làm gì
 ─────────────────────────────────────────────────────────────────
   ≥ 20%          ≤ 5x          im lặng, không hiện gì
   10-20%        5-10x          gợi ý nhẹ: "nên đặt thêm 1 điểm"
    2-10%       10-50x          ⚠ cảnh báo vàng, hiện số khuếch đại
   0.5-2%      50-200x          ⚠ cảnh báo đỏ, đề nghị sửa
   < 0.5%        > 200x         ✖ CHẶN, không cho publish
```

### Vì sao bảng sai số không thay được cảnh báo này

Đây là chỗ dễ bỏ sót nhất:

```
Với đúng 3 điểm gần thẳng hàng:

   Bảng sai số hiện        Thực tế POI cách 100m
   ─────────────────────────────────────────────
   #1  0.000000 m ✓            lệch 50 m ✖
   #2  0.000000 m ✓
   #3  0.000000 m ✓

   → Bảng báo "hoàn hảo" trong khi kết quả sai hẳn
```

Lý do: 3 điểm luôn khớp hoàn hảo (xem cảnh báo 1), nên residual **luôn** bằng 0 bất kể
bố trí thế nào. Cảnh báo 2 vì thế phải tính từ **hình dạng tam giác**, hoàn toàn độc lập
với bảng sai số.

Nói cách khác: **cảnh báo 1 nói "chưa đo được", cảnh báo 2 nói "sắp xếp đang xấu"** — hai
việc khác nhau, cần hai cơ chế khác nhau.

### Chặn cứng: khi nào và tại sao KHÔNG dùng "thẳng hàng hoàn toàn"

Lúc đầu tưởng nên chặn khi ba điểm thẳng hàng hoàn toàn, vì khi đó toán học vô nghiệm
(định thức = 0, chia cho 0). Nhưng tính ra thì ngưỡng đó **vô dụng trong thực tế**:

```
Máy tính (float64) chỉ mất hết chữ số ý nghĩa khi h/D ≈ 1e-10.
Với D = 100 m  →  h = 0.00000001 m = 10 nanomet.

Admin dùng chuột không bao giờ chấm chính xác tới mức đó.
→ "Thẳng hàng hoàn toàn" gần như KHÔNG BAO GIỜ xảy ra.
```

Nên nếu chỉ chặn ở `det == 0` thì thực chất **không bao giờ chặn**, trong khi `h/D = 0.1%`
(khuếch đại 1000x, lệch tay 2m thành 2km) vẫn cho qua.

```
   Cách chặn                       Có chặn được ca xấu?
 ────────────────────────────────────────────────────────────
   det == 0                        KHÔNG — ca xấu vẫn có det ≠ 0
   h/D < 0.5%  (khuếch đại 200x)   CÓ  ◀ dùng cái này
```

Nhưng vẫn cần giữ một cái bắt `det == 0` cho **một ca có thật: hai điểm mốc trùng nhau**
(admin click 2 lần cùng một chỗ). Ca này không phải hai điểm *gần* nhau mà là **cùng đúng một
toạ độ**, nên `det` bằng 0 thật.

Thông báo phải khác cảnh báo 2, vì lời khuyên của cảnh báo 2 vô dụng ở đây:

```
Cảnh báo 2 nói   "đặt thêm 1 điểm lệch hẳn ra khỏi đường đó"
Ca này cần nói   "điểm mốc #2 và #4 trùng nhau — xoá một điểm"
```

⚠ Nếu sau này thêm **snap-to-grid** thì có ca thứ hai: snap làm tròn mất các chênh lệch nhỏ
do tay rung, nên chấm 3 điểm dọc một hàng lưới sẽ thẳng hàng tuyệt đối. Hiện chưa có snap —
"Lưới toạ độ" ở bảng lớp chỉ để *nhìn*, không bắt dính.

**Chặn ở đâu — không chặn lúc đang chấm:**

```
Lúc admin đang chấm điểm      →  chỉ hiện cảnh báo, VẪN cho chấm tiếp
                                 (đang chấm dở thì tất nhiên bố trí còn xấu)
Lúc bấm "Lưu căn chỉnh"       →  cảnh báo + hỏi lại "vẫn lưu?"
Lúc bấm "Publish"             →  ✖ CHẶN nếu h/D < 0.5%
```

Chặn lúc publish chứ không chặn lúc chấm, vì chấm dở dang là chuyện bình thường — chặn
sớm sẽ cản admin làm việc.

**Vì sao không chặn cứng ở mức 2% hay 5%:**

```
POI dạng dài thì mốc TỰ NHIÊN gần một đường thẳng, không phải lỗi admin:

   Một con phố cổ:        ①━━━━━②━━━━━③        h/D có thể chỉ 2-3%
   Bờ hồ, đoạn đê:        ①━━━②━━━━③           mà đó là hình dạng thật

→ Chặn cứng ở 2% sẽ chặn oan các POI này.
→ Chỉ chặn ở 0.5% — mức mà kể cả POI dài nhất cũng không tự nhiên rơi vào.
```

---

## PHẦN 5 — SCREEN 06: hai chế độ vùng tương tác

```
┌─── VÙNG TƯƠNG TÁC ───────────────────────────────────────┐
│                                                          │
│  ◉ Bán kính  (mặc định)                                  │
│                                                          │
│      Bán kính vào    [ 25 ] m   user vào đây = "đang tới"│
│      Bán kính ra     [ 35 ] m   phải ra xa hơn mới "rời" │
│      Thời gian đứng  [  3 ] giây  phải liên tục mới tính │
│                                                          │
│  ○ Vẽ vùng                                               │
│                                                          │
│      [Vẽ trên bản đồ]  [Lấy sẵn từ dữ liệu tòa nhà]      │
│      Số đỉnh: 12/30    [Làm mượt vùng]                   │
│      Vào = trong vùng · Ra = ngoài vùng + [15] m         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Chọn chế độ nào — tiêu chí là HÌNH DẠNG, không phải kích thước

Trước đây ghi "bán kính cho POI nhỏ, vẽ vùng cho di tích lớn". Cách nói đó mơ hồ, vì kích thước
không phải tiêu chí đúng:

```
POI                       Kích thước    Bán kính có đủ?
──────────────────────────────────────────────────────────────────
Ô Quan Chưởng             nhỏ           ✓ hình gọn, gần tròn
Một con phố cổ            DÀI 300 m     ✗ dài mà hẹp, tròn không khớp
Văn Miếu                  350 × 120 m   ✗ chữ nhật dài
Một cái giếng             rất nhỏ       ✓
Quảng trường vuông        60 × 60 m     ✓ tạm được, hình gần tròn
```

Tiêu chí thật:

```
   Hình thực tế có KHỚP hình tròn không?
        │
        ├── khớp (gọn, tỉ lệ dài/rộng < 2)   ──▶  dùng bán kính
        │
        └── không khớp (dài, hẹp, cong,      ──▶  vẽ vùng
            hoặc có ranh giới tường rõ)
```

Nên nhãn trên UI chỉ ghi **"Bán kính"** và **"Vẽ vùng"**, không ghi "cho POI nhỏ / lớn" — để
admin tự nhìn hình thực tế mà quyết, thay vì đoán theo cỡ.

Chỗ cần tooltip là hai nhãn đó, nội dung đúng câu hỏi ở trên: *"Hình khu này có gọn gần tròn
không? Nếu dài và hẹp thì nên vẽ vùng."*

**Vì sao cần 3 con số ở chế độ bán kính** (nên có tooltip, admin sẽ thắc mắc):

```
GPS luôn dao động. User đứng cách POI đúng 24m, nhưng máy đo được:

  23m ──▶ 27m ──▶ 22m ──▶ 31m ──▶ 24m
   ✓      ✗       ✓       ✗       ✓        ← nếu so từng lần đo
  BẬT    TẮT     BẬT     TẮT     BẬT      ← NPC nhấp nháy, user hoang mang

Cách chữa:
  Bán kính ra > bán kính vào  →  chống dao động theo KHÔNG GIAN
  Thời gian đứng ≥ 3 giây     →  chống dao động theo THỜI GIAN
                                  (và chống người đi xe máy ngang qua)
```

**Vì sao cần chế độ vẽ vùng:**

```
Văn Miếu thực tế ~350 x 120 m

  Bán kính 25m:            Bán kính 200m:           Vẽ vùng:
  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
  │  ╭─╮            │      │ ╭─────────────╮ │      │ ╭─────────────╮ │
  │  │o│  ← vùng    │      │ │  ╭───────╮  │ │      │ │▓▓▓▓▓▓▓▓▓▓▓▓▓│ │
  │  ╰─╯    quá nhỏ │      │ │  │  POI  │  │ │      │ │▓▓▓ đúng ▓▓▓▓│ │
  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │      │ │  ╰───────╯  │ │      │ │▓▓▓ hình ▓▓▓▓│ │
  │  di tích thật   │      │ ╰─────────────╯ │      │ ╰─────────────╯ │
  └─────────────────┘      └─────────────────┘      └─────────────────┘
   vào cổng vẫn báo         đứng bên kia đường       khớp thực tế
   "chưa tới"               cũng tính là tới
```

⚠ Dù bật vẽ vùng, **vẫn phải giữ toạ độ tâm** — tâm còn dùng cho pin trên bản đồ, chỉ
đường, và sắp POI theo khoảng cách. Không phải "vùng thay thế toạ độ".

⚠ **Chế độ vẽ vùng cần thêm cột vào database.** Technical Design hiện chỉ có:

```
poi.location   GEOGRAPHY(POINT, 4326)     ← chỉ lưu được 1 điểm
npc.location   GEOGRAPHY(POINT, 4326)
city.center    GEOGRAPHY(POINT, 4326)
```

Không có cột nào lưu được vùng. Cần thêm:

```
poi.interaction_area   GEOGRAPHY(POLYGON, 4326)  NULL
                       NULL = dùng chế độ bán kính (như hiện tại)
                       có giá trị = dùng chế độ vùng, bỏ qua 2 bán kính
poi.area_buffer_m      INT DEFAULT 15            nới thêm khi ra khỏi vùng
```

Kiểm tra "user có trong vùng chưa" thì dùng `ST_Contains` / `ST_DWithin` của PostGIS —
đã có sẵn, không cần thư viện mới. Index `GIST` hiện có trên `location` vẫn giữ, thêm một
index nữa cho `interaction_area`.

Xem PHẦN 16 để biết đủ các chỗ khác Technical Design.

---

## PHẦN 6 — SCREEN 08: panel item, hai nhóm

```
                    ┌─── ITEM CỦA POI ───┐
                    │                    │
        ┌───────────┴──────┐    ┌─────────┴──────────┐
        │  CÓ TOẠ ĐỘ       │    │  KHÔNG CẦN TOẠ ĐỘ  │
        │  → panel cạnh    │    │  → ngay tại item   │
        │    bản đồ        │    │                    │
        ├──────────────────┤    ├────────────────────┤
        │ · NPC            │    │ · Audio narration  │
        │ · Nhãn di tích   │    │ · Nhạc nền         │
        │                  │    │ · Trang webtoon    │
        └──────────────────┘    │ · Video            │
                                └────────────────────┘
```

```
┌──────────────────────────┬──────────────────────────────────┐
│  BẢN ĐỒ / TRANH          │  ITEM CỦA POI NÀY                │
│                          │                                  │
│      📍 POI              │  ▼ NPC (3)                       │
│      👤 NPC 1  ◀── chọn  │     • Cụ bán nước        ✓       │
│      👤 NPC 2            │     • Ông thợ rèn        ⚠ chưa  │
│      🏷 Nhãn             │     • Cô bán hoa         ✓       │
│                          │  ▼ Nhãn di tích (1)              │
│  Chế độ xem:             │     • "Ô Quan Chưởng"    ✓       │
│  ◉ Trên tranh            │                                  │
│  ○ Trên bản đồ thật      │  [+ Thêm NPC]                    │
│  ▲ PHẢI hiện rõ,         │                                  │
│    không thì admin       │                                  │
│    nhầm đang sửa         │                                  │
│    toạ độ nào            │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

⚠ **"Nhãn di tích" hiện CHƯA có trong Technical Design.** Tìm cả tài liệu không thấy bảng
nào cho nhãn, cũng không có cột toạ độ nhãn. Cần thêm:

```
CREATE TABLE poi_label (
  id UUID PRIMARY KEY,
  poi_id UUID REFERENCES poi(id),
  text JSONB,                        -- vi/en/zh
  artwork_position JSONB,            -- {x,y} vị trí nhãn TRÊN TRANH
  anchor TEXT DEFAULT 'bottom',      -- trên | dưới | trái | phải
  ...
);
```

Vì sao cần `artwork_position` riêng, không dùng chung với pin POI:

```
Đặt nhãn TRÙNG pin:                Đặt nhãn LỆCH ra, có anchor:

   ╭─────────────╮                    ╭─────────────╮
   │   ▓▓▓▓▓▓▓   │                    │  ⌂⌂⌂ tranh  │
   │ ┌─────────┐ │                    │  ⌂⌂⌂⌂⌂⌂⌂⌂   │
   │ │Ô Quan Ch│ │ ← nhãn che         │      📍     │
   │ └─────────┘ │   mất tranh        │  ┌────────┐ │
   │   ▓▓▓▓▓▓▓   │                    │  │Ô Quan..│ │ ← nhãn dưới pin
   ╰─────────────╯                    ╰─────────────╯
```

Tranh vẽ tay là thứ khách hàng đầu tư nhiều nhất — che mất nó là mất giá trị chính của app.

**Cơ chế rút thao tác cho NPC:**

```
CÁCH CŨ (theo Technical Design hiện tại):
   admin đặt trên tranh  ──▶  admin đặt lại trên bản đồ thật
        (1 thao tác)              (1 thao tác nữa)
   → 50 POI x 3 NPC = 300 lượt thao tác

CÁCH ĐỀ XUẤT:
   admin đặt trên tranh  ──▶  hệ GỢI Ý toạ độ GPS  ──▶  admin xác nhận
        (1 thao tác)          (dùng phép căn ở 07)      (1 click)
   → vẫn lưu 2 giá trị độc lập, chỉ bớt 1 lượt đặt tay
```

### NPC vào hệ thống bằng đường nào

NPC chủ yếu **là hình ảnh** (nhân vật vẽ tay, nền trong suốt). Nên có 2 bước rời nhau:
đưa ảnh vào kho, rồi kéo từ kho ra tranh.

```
BƯỚC 1 — nạp ảnh vào danh sách NPC
┌─── DANH SÁCH NPC CỦA POI ──────────────────────────┐
│  ┌──────────────────────────────────────────────┐  │
│  │   Kéo file ảnh vào đây, hoặc [Chọn file]     │  │
│  │   PNG nền trong suốt · nhiều file một lượt   │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│   [👤]  cu-ban-nuoc.png      chưa đặt vị trí  ⚠    │
│   [👤]  ong-tho-ren.png      chưa đặt vị trí  ⚠    │
│   [👤]  co-ban-hoa.png       đã đặt  ✓             │
└────────────────────────────────────────────────────┘

BƯỚC 2 — kéo từ danh sách ra tranh
    danh sách ──── kéo thả ────▶  tranh vẽ
                                   │
                                   ├─ thả xuống = có artwork_position
                                   ├─ hệ gợi ý GPS từ phép căn
                                   └─ hiện ô nhập tên + chọn cỡ
```

**Vì sao tách 2 bước:** nạp ảnh là việc hàng loạt (10-20 file một lượt), đặt vị trí là việc
từng cái một. Gộp lại thì admin phải upload rồi đặt, upload rồi đặt — chậm.

Ảnh đã nạp mà chưa đặt vị trí thì vẫn nằm trong danh sách kèm dấu ⚠. Đây cũng là danh sách
việc-cần-làm: còn ⚠ nghĩa là chưa xong POI này.

### Cỡ NPC trên tranh

Từ artwork mẫu, các khối nhà chênh nhau **hơn 5 lần** (34 px đến 183 px). NPC đứng cạnh
tháp và NPC đứng cạnh chuông lâu phải khác cỡ, không thì sai tỉ lệ thấy rõ.

```
┌─── NPC: Cụ bán nước ───────────────────────────────┐
│  Ảnh    [👤 cu-ban-nuoc.png]                       │
│  Tên    [Cụ bán nước                   ] vi/en/zh  │
│  ────────────────────────────────────────────────  │
│  Cỡ     ○ Nhỏ    ◉ Vừa    ○ Lớn    ○ Tự nhập       │
│         ▓▓▓▓▓▓▓▓▓░░░░  1.0x                        │
│                                                    │
│  Xem thử tại chỗ:                                  │
│    ⌂⌂⌂⌂⌂         ← so với công trình cạnh nó       │
│    ⌂⌂👤⌂⌂                                          │
│  ────────────────────────────────────────────────  │
│  Vị trí trên tranh   x 420 · y 380   [Kéo lại]     │
│  Toạ độ GPS   21.0285, 105.8502   (hệ gợi ý) ✓     │
└────────────────────────────────────────────────────┘
```

Ba cỡ sẵn thay vì bắt nhập số — admin không nghĩ theo hệ số, họ nghĩ "to hơn chút". Ô tự
nhập để dành ca đặc biệt.

**Xem thử ngay tại chỗ** là phần quan trọng: cỡ đúng hay sai chỉ biết khi đặt cạnh công
trình, không biết khi xem ảnh rời.

### Thứ tự nội dung trong một điểm

Một POI hoặc NPC có nhiều lớp nội dung — vừa text, vừa audio, vừa webtoon. Cần field
`order` để sắp thứ tự tự nhiên, không thì hệ tự sắp theo thời gian tạo, ra thứ tự vô nghĩa.

```
┌─── NỘI DUNG CỦA: Cụ bán nước ───────────────────────┐
│  (kéo ⠿ để sắp lại thứ tự user gặp)                 │
│  ────────────────────────────────────────────────   │
│  ⠿ 1  📝 Lời mở đầu           text     🔇 cần xem   │
│  ⠿ 2  🔊 Kể chuyện cổng ô     audio    🎧 nghe được │
│  ⠿ 3  🖼 Truyện tranh 12 trang webtoon 🔇 cần xem   │
│  ⠿ 4  🔊 Bài hát ru           audio    🎧 nghe được │
│  ────────────────────────────────────────────────   │
│  [+ Thêm nội dung ▾]                                │
└─────────────────────────────────────────────────────┘
```

Technical Design đã có `sort_order` ở `topic_poi`, `story_page`, `series_item` — nhưng
**chưa có** cho các lớp nội dung trong cùng một điểm. Cần thêm.

### Nội dung nào chạy được khi tắt màn hình

Cột `🎧 / 🔇` ở bảng trên. Chỉ **audio** phát được khi user cất máy vào túi — text và
webtoon bắt buộc phải nhìn.

```
Loại nội dung      Tắt màn hình     Vì sao
────────────────────────────────────────────────────────────
🔊 audio narration     ✓ được       tai nghe vẫn nghe
🔊 nhạc nền            ✓ được
📝 text                ✗ không      phải đọc
🖼 webtoon             ✗ không      phải xem
🎬 video               ✗ không      phải xem
```

Cần field `playable_screen_off BOOLEAN` — suy từ loại nội dung được, nhưng nên lưu tường
minh vì sau này có thể có ca lai (video mà phần lớn là tiếng, tắt hình vẫn theo được).

App dùng field này để: khi user cất máy, tự bỏ qua các lớp không nghe được và phát lớp
audio tiếp theo, thay vì dừng im.

⚠ Technical Design dòng 508 ghi *"KHÔNG background audio"* — đó là ranh giới của **Zalo
Mini App** (§15), không phải app native. App native làm được, chỉ cần khai báo chế độ chạy
nền cho audio.

---

## PHẦN 7 — CÂY 7 CẤP: chỗ cần lưu ý

```
Country
  └── City
       └── Topic ────┐
                     │  ⚠ QUAN HỆ N-N: một POI thuộc NHIỀU Topic
       └── Topic ────┼──▶ POI
                     │      ├── NPC ──── Story
       └── Topic ────┘      └── Hidden Thread
```

Cây phải xử lý được chuyện POI xuất hiện dưới nhiều Topic. Gợi ý: hiện POI dưới mọi Topic
chứa nó, kèm dấu hiệu *"điểm này còn thuộc 2 tuyến khác"*.

```
┌─── CÂY NỘI DUNG ──────────────────┐
│ 🔍 [tìm...]      Lọc: [Tất cả ▾]  │
├───────────────────────────────────┤
│ ▼ 🌏 Việt Nam                     │
│   ▼ 🏙 Hà Nội                     │
│     ▼ 🗂 Phố cổ — huyền bí        │
│       • 📍 Ô Quan Chưởng  ✓ 🔗2    │  ← 🔗2 = còn thuộc 2 tuyến khác
│         ▼ 👤 Cụ bán nước          │
│           • 📖 Chuyện cổng ô  ✓   │
│         • 🔒 Bí mật cánh cổng     │
│       • 📍 Đền Bạch Mã  ⚠ nháp    │
│     ▶ 🗂 Ẩm thực đêm              │
│                                   │
│ Ký hiệu:                          │
│  ✓ đã publish   ⚠ nháp/thiếu      │
│  🌐 thiếu bản dịch                │
│  📐 CHƯA căn artwork  ← dễ bỏ sót │
└───────────────────────────────────┘
```

---

## PHẦN 8 — SCREEN 10: webtoon editor

```
┌─── STORY: "Chuyện cổng ô" ──────────────────────────────────┐
│  Chế độ:  ○ Chỉ audio   ○ Chỉ webtoon   ◉ Cả hai            │
├─────────────────────────────────────────────────────────────┤
│  AUDIO                                                      │
│   Narration  [chuyen-cong-o.mp3]  4:32                      │
│   Nhạc nền   [ambient-pho-co.mp3] 4:32                      │
├─────────────────────────────────────────────────────────────┤
│  TRANG WEBTOON                                              │
│   [+ Tải nhiều ảnh cùng lúc]   ☑ tự sắp theo tên file       │
│   ────────────────────────────────────────────────────────  │
│   ⠿ 1  [▤]  trang-01.jpg   3000 ms                          │
│   ⠿ 2  [▤]  trang-02.jpg   2500 ms                          │
│   ⠿ 3  [▤]  trang-03.jpg   4000 ms                          │
│   ⠿ ...                                                     │
│   ▲ kéo để sắp lại thứ tự                                   │
│   ────────────────────────────────────────────────────────  │
│   ▶ Nâng cao: mốc thời gian audio khớp trang  (phase sau)   │
└─────────────────────────────────────────────────────────────┘
```

Upload nhiều ảnh một lượt là bắt buộc — một story có thể vài chục trang.

Phần đồng bộ audio ↔ trang đã chốt để **phase sau**, nên để thu gọn, chỉ chừa field.

---

## PHẦN 9 — SCREEN 04: Country / City

CRUD thường, không thuộc nhóm khó. Có mockup ở đây để design tool không phải đoán.

```
┌─── CITY: "Hà Nội" ─────────────────────────────────────────┐
│  Quốc gia: [Việt Nam ▾]                                    │
├────────────────────────────────────────────────────────────┤
│  Tên (vi/en/zh)     [Hà Nội / Hanoi / 河内            ]    │
│  Ảnh đại diện       [upload]                               │
│  ──────────────────────────────────────────────────────    │
│  Tâm bản đồ         kéo pin trên map                       │
│     ┌──────────────────────────┐                           │
│     │        📍                │  21.0285, 105.8542        │
│     └──────────────────────────┘                           │
│  Dải zoom offline   [ 11 ] – [ 19 ]                        │
├────────────────────────────────────────────────────────────┤
│  TOPIC THUỘC CITY NÀY   (kéo ⠿ để sắp thứ tự)              │
│   ⠿ 1  Phố cổ — huyền bí                          ✓        │
│   ⠿ 2  Ẩm thực đêm                                ⚠ nháp   │
│   [+ Thêm Topic]                                           │
└────────────────────────────────────────────────────────────┘
```

**Dùng lại component có sẵn, không dựng mới:**

```
Tâm bản đồ       →  đúng component pin của SCREEN 06, chỉ đổi entity gắn vào
Tên đa ngôn ngữ  →  đúng component i18n dùng khắp hệ thống
Danh sách con    →  đúng component kéo-sắp của SCREEN 05 (POI thuộc tuyến)
```

**Dải zoom offline** map thẳng tới `city.default_zoom_range INT4RANGE` — field này Technical
Design §3.3 dòng 109 **đã có**, chỉ chưa có UI nhập.

**Màn Country** dùng chung layout, bỏ 2 field thuộc cấp City:

```
                      Country      City
  ────────────────────────────────────────
  Tên đa ngôn ngữ        ✓          ✓
  Ảnh đại diện           ✓          ✓
  Tâm bản đồ             ✗          ✓
  Dải zoom offline       ✗          ✓     ← gói offline tính theo city
  Danh sách con      City list   Topic list
```

Tâm bản đồ và dải zoom thuộc City vì **gói offline tính theo city** — một quốc gia không có
"tâm" hay "mức zoom" nào có nghĩa.

---

## PHẦN 10 — SCREEN 05: vùng topic

```
┌─── TOPIC: "Phố cổ — huyền bí" ──────────────────────────────┐
│  Loại tuyến: [Truyền thuyết ▾]                              │
├─────────────────────────────────────────────────────────────┤
│  VÙNG TOPIC TRÊN BẢN ĐỒ                                     │
│   ┌───────────────────────────────┐                         │
│   │   ╭──────────────╮            │  [Vẽ vùng]              │
│   │   │▓▓▓ ảnh minh ▓│            │  Ảnh: pho-co.png        │
│   │   │▓▓▓ hoạ topic▓│            │  Opacity ▓▓▓▓▓░░ 60%    │
│   │   ╰──────────────╯            │                         │
│   └───────────────────────────────┘                         │
│                                                             │
│   ⚠ Mapbox chỉ nhận ảnh theo 4 GÓC (tứ giác), không nhận    │
│     vùng bất kỳ. Nên CMS sẽ tự cắt ảnh theo vùng đã vẽ      │
│     (ngoài vùng thành trong suốt) rồi mới đưa lên app.      │
│     Admin xem trước ảnh SAU KHI CẮT, không phải ảnh gốc.    │
│     Nguồn: docs.mapbox.com/style-spec/reference/sources     │
│                                                             │
│   ⚠ Vùng topic CHỈ để hiển thị + lọc POI.                   │
│     KHÔNG liên quan tải offline — đơn vị offline là POI.    │
├─────────────────────────────────────────────────────────────┤
│  POI THUỘC TUYẾN  (kéo để sắp thứ tự)                       │
│   ⠿ 1  Ô Quan Chưởng                                        │
│   ⠿ 2  Đền Bạch Mã                                          │
└─────────────────────────────────────────────────────────────┘
```

⚠ **Vùng topic cũng cần cột mới.** Bảng `topic` hiện không có cột hình học nào. Cần:

```
topic.display_area      GEOGRAPHY(POLYGON, 4326)  NULL   vùng đã vẽ
topic.overlay_asset_id  UUID                      NULL   ảnh SAU KHI CẮT
topic.overlay_corners   JSONB                     NULL   4 góc cho Mapbox
topic.overlay_opacity   NUMERIC DEFAULT 0.6
```

Lưu **cả** `display_area` (vùng gốc admin vẽ, để sửa lại được) **và** `overlay_corners`
(4 góc bao ngoài, để đưa cho Mapbox). Nếu chỉ lưu 4 góc thì admin mất vùng gốc, muốn sửa
phải vẽ lại từ đầu.

---

## PHẦN 11 — LUỒNG PUBLISH

```
   nháp ──(publish)──▶ đã publish ──(sửa + publish lại)──▶ version++
                            │
                            ├──(ẩn)──▶ ẩn
                            │            └── app ẩn, NHƯNG dữ liệu offline
                            │                đã tải về vẫn dùng được
                            └──(lưu trữ)──▶ lưu trữ

   ┌─── KIỂM TRA TRƯỚC KHI PUBLISH ─────────────────────────┐
   │  ✓ Có tiêu đề (vi)                                     │
   │  ⚠ Thiếu bản dịch: en, zh          ← cảnh báo, cho qua │
   │  ✖ CHƯA căn artwork                ← CHẶN              │
   │  ✖ Mốc căn dồn 1 đường (h/D<0.5%)  ← CHẶN  (PHẦN 4)    │
   │  ⚠ Chỉ có 3 điểm mốc               ← cảnh báo, cho qua │
   │  ✓ Có ít nhất 1 NPC                                    │
   └────────────────────────────────────────────────────────┘

   Sau khi publish, với user ĐÃ tải offline bản cũ:
      → app GỢI Ý "có bản cập nhật", user tự bấm mới tải
      → KHÔNG tự tải đè
      → KHÔNG reset trạng thái đã hoàn thành   ("xong là xong")
```

---

## PHẦN 12 — CÁC CON SỐ ĐÃ CHỐT

```
Bán kính vào (mặc định)        25 m      cấu hình từng POI
Bán kính ra (mặc định)         35 m      luôn > bán kính vào
Thời gian đứng tối thiểu        3 giây   phải liên tục
Nới thêm khi dùng vùng         15 m      thay cho cặp bán kính
Số đỉnh vùng tối đa           20-30      nhiều hơn thì không sửa được
Tỉ lệ dài/rộng chọn chế độ      < 2      dưới 2 dùng bán kính, trên 2 vẽ vùng
                                          (tiêu chí ở PHẦN 5, KHÔNG theo kích thước)
Ngưỡng cảnh báo h/D           < 10%      mốc dồn gần 1 đường (PHẦN 4)
Ngưỡng chặn publish h/D      < 0.5%      khuếch đại > 200 lần
Điểm mốc căn artwork      min 3, nên 5-6  3 thì không kiểm tra được
Cỡ NPC trên tranh mặc định     1.0x      3 mức sẵn Nhỏ/Vừa/Lớn (PHẦN 6)
Gói offline đầy đủ           ~150 MB     audio + webtoon/video + tiles
Gói chỉ audio                 ~20 MB     vừa đi vừa nghe
Dải zoom offline              11-19      cấu hình theo thành phố
Ngôn ngữ                    vi/en/zh     có ngôn ngữ dự phòng
```

---

## PHẦN 13 — ARTWORK LÀ ISOMETRIC: RÀNG BUỘC BẮT BUỘC

Artwork mẫu (`artwork-mau-tham-chieu.png`) vẽ **nhìn nghiêng (isometric)**, không phải nhìn
từ trên xuống. Đây là ràng buộc lớn nhất của SCREEN 07.

### Vấn đề: một toạ độ GPS, hai vị trí trên tranh

```
   Tranh isometric                       Thực tế nhìn từ trên
   ─────────────────                     ────────────────────
        ╱▔▔╲   ← đỉnh mái
       ╱    ╲     (px cao hơn)
      ╱______╲                                  ┌────┐
      │      │                                  │    │  ← chỉ 1 điểm
      │      │                                  └────┘
      └──────┘  ← chân nhà
                   (px thấp hơn)
   Hai chỗ khác nhau trên tranh    →    CÙNG một toạ độ GPS
```

Không phép chiếu 2D nào giải được — vì đây không phải sai số, mà là thông tin bị mất khi
vẽ nghiêng. Chỉ có thể **quy ước**.

### Số đo thật từ artwork mẫu

Đo trên ảnh mẫu, quy đổi giả định khu di tích rộng 150 m:

```
Khối công trình              cao trên tranh    lệch thực địa tương đương
──────────────────────────────────────────────────────────────────────────
Đại Hùng Bảo Điện (giữa)         54 px               22.3 m
Pháp Đường                       39 px               16.1 m
Chuông lâu                       34 px               14.0 m
Tháp (góc trên-trái)            183 px               75.6 m   ◀ cao nhất
──────────────────────────────────────────────────────────────────────────
                                      bán kính tương tác mặc định  25 m
```

Nghĩa là **chấm mốc ở đỉnh thay vì chân có thể lệch 14–75 m** — bằng hoặc vượt hẳn bán
kính 25 m.

### Quy ước bắt buộc

```
┌────────────────────────────────────────────────────────────┐
│ ĐIỂM MỐC LUÔN CHẤM Ở CHÂN CÔNG TRÌNH                       │
│ (chỗ tường gặp mặt đất), KHÔNG chấm ở đỉnh mái hay nóc.    │
└────────────────────────────────────────────────────────────┘
```

CMS phải hiện dòng này **ngay cạnh chỗ chấm mốc**, không để trong tài liệu hướng dẫn
riêng — admin sẽ không đọc.

Áp dụng cho cả:
- điểm mốc căn artwork (SCREEN 07)
- vị trí POI trên tranh (SCREEN 06)
- vị trí NPC trên tranh (SCREEN 08)

⚠ Quy ước này phải chốt **trước** khi admin nhập liệu. Biết muộn = căn lại toàn bộ 50 POI.

### Kéo theo: NPC cần scale được

Các khối nhà trên tranh chênh nhau 34–183 px, tức **hơn 5 lần**. NPC đứng cạnh Tháp và NPC
đứng cạnh Chuông lâu phải vẽ khác cỡ, không thì sai tỉ lệ thấy rõ.

→ SCREEN 08 cần field `npc.artwork_scale` (xem PHẦN 16 mục **g**), mặc định `1.0`.

---

## PHẦN 14 — ĐỊNH DẠNG LƯU DỮ LIỆU

Cần tách rõ **lưu** và **truyền** — hai chỗ dùng định dạng khác nhau.

```
Tầng                    Định dạng                        Vì sao
──────────────────────────────────────────────────────────────────────────────
Lưu (PostGIS)     GEOGRAPHY native + JSONB      query được ST_Contains,
                                                 ST_DWithin cho geofence
Truyền cho app    GeoJSON (RFC 7946)            Mapbox GL JS đọc trực tiếp,
                                                 gói nhẹ
Xuất/nhập tay     GeoJSON                       mở được bằng QGIS, text editor
Gói offline lớn   dạng nhị phân (MVT/Geobuf)    nếu GeoJSON quá nặng
```

**Điểm chính: KHÔNG lưu dưới dạng text (XML/JSON) trong cột.** Technical Design đã dùng
`GEOGRAPHY(POINT, 4326)` — đúng hướng, giữ nguyên.

```
Nếu lưu text:                        Nếu lưu native:
  mỗi lần kiểm "user trong vùng?"      SELECT ... WHERE
  → đọc text ra, parse, tính            ST_DWithin(location, $point, 25)
  → không index được                    → index GIST, nhanh
```

**Vì sao GeoJSON mà không phải XML/GML/KML:**

```
                    GeoJSON        GML / KML
────────────────────────────────────────────────────────────
Mapbox GL JS        đọc trực tiếp  phải chuyển đổi trước
PostGIS             ST_AsGeoJSON   cần lớp trung gian
                    có sẵn
Kích thước          gọn            lớn hơn nhiều
Sinh ra để làm gì   web/app        GML: dịch vụ OGC, dữ liệu
                                    cơ quan nhà nước
                                   KML: Google Earth, trình chiếu
```

GML là định dạng bắt buộc cho dịch vụ WFS và dữ liệu chính phủ EU; khuyến nghị thông thường
khi làm app là **chuyển GML sang GeoJSON ngay bước đầu**. Dự án này không có yêu cầu nộp cơ
quan nào nên không cần GML.

Nếu sau này khách cần xuất cho Google Earth thì thêm KML **ở tầng xuất**, không đổi tầng lưu.

⚠ **Bẫy thường gặp:** GeoJSON dùng `[lon, lat]` còn KML/GPX dùng `[lat, lon]` — **ngược
nhau**. Đây là nguồn bug rất phổ biến. Chốt sẵn: trong toàn hệ thống dùng `[lon, lat]`, chỉ
đảo ở đúng chỗ xuất KML.

### Dữ liệu căn artwork lưu ra sao

```
artwork.calibration  JSONB
{
  "corners": [                    ← 4 GÓC cho Mapbox, SUY RA từ control_points
    [105.8500, 21.0290],          ← thứ tự kim đồng hồ từ trên-trái
    [105.8510, 21.0290],
    [105.8510, 21.0280],
    [105.8500, 21.0280]
  ],
  "control_points": [             ← ĐIỂM MỐC, cho phép đổi toạ độ
    { "artwork": [120, 340], "gps": [105.8502, 21.0288],
      "label": "Cổng chính", "residual_m": 4.1 },
    ...
  ],
  "affine": [a, b, c, d, e, f],   ← 6 tham số đã fit, lưu để khỏi tính lại
  "rmse_m": 6.6,
  "worst_m": 8.9,
  "shape_ratio": 0.34             ← h/D, để biết có cần cảnh báo 2
}
```

Lưu sẵn `affine` và `shape_ratio` thay vì tính lại mỗi lần mở màn: app cũng cần `affine`
để render, mà app không nên tự fit least-squares.

---

## PHẦN 15 — CÂU HỎI CÒN LẠI

```
1. Hidden Thread có cần TOẠ ĐỘ RIÊNG không?
   → ảnh hưởng SCREEN 08 và 12
   → hiện xếp vào nhóm không toạ độ (gắn POI là đủ)
   → nếu user phải tới ĐÚNG MỘT CHỖ trong khu vực POI mới mở được
     thì phải thêm field

2. NPC có cần VẼ VÙNG không, hay chỉ POI?
   → hiện giả định chỉ POI

3. Khu di tích trên artwork mẫu rộng thực tế bao nhiêu mét?
   → cần để chốt tỉ lệ px/m và cỡ NPC mặc định
   → bảng số đo ở PHẦN 13 đang giả định 150 m

4. Một tranh phủ NHIỀU POI, hay mỗi POI một tranh riêng?   ◀ GẤP NHẤT
   → nếu dùng chung thì màn 07 phải tách ra cấp tranh, không để làm
     tab trong POI (chi tiết ở đầu PHẦN 4)
   → chỉ cần xem 1-2 file artwork thật là trả lời được
```

### Đề xuất mặc định cho hai câu đầu

Hai câu này là quyết định sản phẩm, tài liệu không tự giải được. Nhưng đề xuất sẵn một hướng
để có cái mà bàn:

**Câu 1 — Hidden Thread:** thêm cột **cho phép NULL**, quyết định UX sau.

```
hidden_thread.location  GEOGRAPHY(POINT, 4326)  NULL

   NULL       = giữ nguyên hành vi hiện tại (gắn POI là đủ)
   có giá trị = phải đứng đúng điểm đó trong vùng POI mới mở được
```

Cột cho phép NULL thì migrate **không rủi ro** — dữ liệu cũ không đổi hành vi. Thêm cột lúc này
rẻ; thêm sau khi admin nhập 50 POI mới đau. Còn có dùng hay không thì quyết sau.

**Câu 2 — NPC vẽ vùng:** đề xuất **KHÔNG**.

```
NPC dùng chung vùng tương tác của POI cha.
Schema hiện cũng không có bán kính riêng cho NPC → đúng hướng này.
```

Nếu sau này phát sinh ca cần NPC kích hoạt độc lập — ví dụ POI vẽ vùng 350×120 m mà chỉ một góc
có NPC — thì ưu tiên cách đơn giản hơn polygon:

```
Cách xử lý khi phát sinh          Chi phí
──────────────────────────────────────────────────────────────
Dùng npc.location + bán kính      rẻ — cột location ĐÃ CÓ
Vẽ polygon riêng cho NPC          đắt — thêm cột, thêm UI vẽ,
                                   thêm chỗ cho admin nhầm
```

Điểm đơn + bán kính giải được gần hết ca thực tế. Chỉ thêm polygon nếu gặp ca mà điểm đơn thật
sự không kham nổi.

---

## PHẦN 16 — CÁC CHỖ KHÁC TECHNICAL DESIGN

**Tám** chỗ tài liệu này đề xuất khác Technical Design v0.2. Gom lại một chỗ để rà nhanh.

```
                                             ẢNH HƯỞNG
─────────────────────────────────────────────────────────────────────────────
a) THÊM CỘT: vùng tương tác POI              PHẦN 5   · schema + backend
b) THÊM BẢNG: nhãn di tích                   PHẦN 6   · schema + CMS + app
c) THÊM CỘT: vùng topic + ảnh phủ            PHẦN 10  · schema + CMS
d) ĐỔI LUỒNG: rút thao tác NPC 2 → 1         PHẦN 6   · chỉ CMS, không đổi schema
e) THÊM CỘT: thứ tự lớp nội dung             PHẦN 6   · schema + app
f) THÊM CỘT: chạy được khi tắt màn hình      PHẦN 6   · schema + app
g) THÊM CỘT: cỡ NPC trên tranh               PHẦN 6   · schema + CMS + app
h) THÊM CỘT: toạ độ Hidden Thread (NULL)     PHẦN 15  · schema, migrate không rủi ro
```

**a) Vùng tương tác POI** — `poi.interaction_area GEOGRAPHY(POLYGON)` + `area_buffer_m`.
Vì `GEOGRAPHY(POINT)` không lưu được vùng. Văn Miếu ~350×120 m, bán kính nào cũng sai.

**b) Nhãn di tích** — bảng `poi_label` mới. Tài liệu hiện **không có** khái niệm nhãn.
Cần vị trí riêng để nhãn không che tranh vẽ tay.

**c) Vùng topic** — `topic.display_area` + 4 góc ảnh phủ. Lưu cả vùng gốc lẫn 4 góc, vì
Mapbox chỉ nhận tứ giác nhưng admin cần sửa lại vùng gốc.

**d) Rút thao tác NPC** — Technical Design dòng 375 ghi *"Không suy ra tự động — Admin căn
chỉnh trực quan, giảm sai số"*:

```
HIỆN TẠI (theo tài liệu)              ĐỀ XUẤT
admin đặt trên tranh                  admin đặt trên tranh
      +                                     ↓
admin đặt LẠI trên bản đồ thật        hệ GỢI Ý toạ độ GPS (từ phép căn ở 07)
                                             ↓
                                      admin xác nhận (hoặc kéo lại nếu sai)

50 POI × 3 NPC = 300 lượt đặt tay     150 lượt đặt + 150 click xác nhận
```

**Vẫn giữ nguyên tinh thần tài liệu:** hai giá trị lưu độc lập, admin vẫn là người quyết
định cuối. Chỉ khác là hệ điền trước thay vì để trống. Nếu cần giữ đúng nguyên văn
"không suy ra tự động" thì làm 2 thao tác như tài liệu.

**e) Thứ tự lớp nội dung** — Technical Design đã có `sort_order` ở `topic_poi`,
`story_page`, `series_item`, nhưng chưa có cho các lớp nội dung trong **cùng một** POI/NPC.

```
content_block.order  INT
   Một NPC có: text mở đầu + audio kể chuyện + webtoon + audio hát ru
   → không có order thì app tự sắp theo thời gian tạo, ra thứ tự vô nghĩa
```

**f) Chạy được khi tắt màn hình** — cần field để app biết lớp nào bỏ qua được khi user cất
máy vào túi.

```
content_block.playable_screen_off  BOOLEAN
   audio → true · text/webtoon/video → false
   Suy từ loại được, nhưng lưu tường minh để xử lý ca lai
   (video mà phần lớn là tiếng, tắt hình vẫn theo được)
```

**g) Cỡ NPC trên tranh** — schema có `npc.artwork_position {x,y}` nhưng không có cỡ.

```
npc.artwork_scale  NUMERIC DEFAULT 1.0
   Artwork mẫu: các khối nhà chênh nhau hơn 5 lần (34 px → 183 px)
   → NPC cùng một cỡ sẽ sai tỉ lệ thấy rõ
```

**h) Toạ độ Hidden Thread** — `hidden_thread.location GEOGRAPHY(POINT, 4326) NULL`. NULL =
giữ hành vi hiện tại, có giá trị = phải đứng đúng chỗ đó mới mở. Lý do ở PHẦN 15 câu 1.

⚠ Bảy mục **a, b, c, e, f, g, h** là thay đổi schema — chốt muộn thì phải migrate sau khi
admin đã nhập liệu. Mục **d** đổi lúc nào cũng được, chỉ là luồng CMS.

```
Rủi ro nếu chốt muộn
─────────────────────────────────────────────────────────────────
h          THẤP   cột NULL, dữ liệu cũ không đổi hành vi
e, f, g    VỪA    thêm cột có default, backfill đơn giản
a, b, c    CAO    đổi cách lưu hình học / thêm bảng — phải nhập
                  lại vùng và nhãn bằng tay
```

---

## PHẦN 17 — CÔNG CỤ ĐÃ CÓ ĐỂ XEM TRƯỚC

Bài toán căn ảnh ↔ toạ độ **đã có người giải rồi**. Nên xem UI thật của các tool này trước khi
brief, thay vì tưởng tượng từ đầu.

```
QGIS Georeferencer          ◀ XEM TRƯỚC TIÊN — miễn phí, cài 5 phút
   Raster ▸ Georeferencer (bản 3.26+ thì Layer ▸ Georeferencer)
   Bảng GCP có đúng 3 cột mình cần: dX · dY · Residual
   Có sẵn câu chốt về outlier: "nếu một GCP có sai số cao bất thường,
   thường là do nhập sai toạ độ" — đúng ý bảng sai số ở PHẦN 4
   Kiểm bằng cách phủ lên OpenStreetMap ở 40% trong suốt — đúng chế độ ② ở PHẦN 4
   https://www.qgistutorials.com/en/docs/3/georeferencing_basics.html

ArcGIS Pro — thẻ Georeference
   Nguồn của công thức RMSE dùng ở PHẦN 4. Nhóm Review mở bảng
   "control points and residuals", mỗi dòng có toạ độ gốc + toạ độ sau
   điều chỉnh + sai số; tổng hợp bằng RMS error
   Đáng chú ý 2 chi tiết dùng được:
     · nút đổi sai số từ độ sang MÉT  → mình cũng nên hiện mét
     · bỏ tick 1 dòng thì điểm đó không tính vào RMS
       → cho admin "tạm loại 1 mốc" để thử, không cần xoá hẳn
   https://doc.esri.com/en/arcgis-pro/latest/help/data/imagery/georeferencing-tools.html

Overlayr (mapmagician.in)   ◀ GẦN use-case nhất
   App georeference chạy trên điện thoại. Có sẵn 3 thứ PHẦN 4 đang cần:
     · đặt ≥3 điểm mốc kèm KÍNH LÚP phóng to  → đúng chế độ ① zoom riêng
     · thanh trượt trong suốt để so với ảnh vệ tinh → đúng chế độ ②
     · hiện vị trí GPS thật lên overlay
   Xuất được KMZ + world file (ArcGIS/QGIS đọc được)
   https://www.mapmagician.in/overlayr/
```

⚠ **Hai chỗ Overlayr KHÁC mình, đừng bắt chước nguyên:**

```
                        Overlayr              BonVoye CMS
  ─────────────────────────────────────────────────────────────────
  Nền tảng          Android (chưa có iOS)   web CMS trên desktop
  Xuất GeoJSON      KHÔNG có                cần (xem PHẦN 14)
  Ảnh nền           ảnh vệ tinh Google      Mapbox
  Đối tượng dùng    người đi thực địa       admin ngồi bàn
```

Overlayr tự nhận *"không phải GIS đầy đủ và không cố làm vậy"* — nó chỉ làm đúng bước
georeference trên mobile. Nên tham khảo **cách bố trí UI**, không tham khảo phạm vi tính năng.

**Cách dùng khi brief:** dán link QGIS + Overlayr kèm PHẦN 4 và PHẦN 13. Ba chế độ xem và bảng
lớp ở PHẦN 4 gần như mô tả lại UI của Overlayr, chỉ khác là chạy trên web.

---

## PHẦN 18 — DÙNG FILE NÀY LÀM PROMPT

Text diagram dùng lại được làm input cho design tool.

```
File này                          →  dùng cho
─────────────────────────────────────────────────────────────────
PHẦN 4 (SCREEN 07 chi tiết)       →  brief dựng màn khó, hi-fi
PHẦN 5, 6 (SCREEN 06, 08)         →  brief dựng màn vừa
PHẦN 9 (SCREEN 04 Country/City)   →  brief dựng màn CRUD
PHẦN 1, 3 (bản đồ màn + luồng)    →  cho design tool hiểu bối cảnh
PHẦN 12 (con số)                  →  ràng buộc, tránh tool tự đổi số
PHẦN 13 (isometric)               →  BẮT BUỘC dán kèm khi dựng 06/07/08
PHẦN 14 (định dạng dữ liệu)       →  chỉ khi dựng phần nhập/xuất
PHẦN 15 (câu hỏi)                 →  đánh dấu chỗ đang là giả định
PHẦN 16 (khác tài liệu)           →  KHÔNG dán, là chỗ cần người quyết
PHẦN 17 (công cụ tham khảo)       →  dán LINK kèm PHẦN 4, không dán cả mục
```

Cách dùng: dán **PHẦN 1 + PHẦN 12 + phần của màn cần dựng**. Không cần dán cả file —
tool sẽ loãng.

PHẦN 13 phải dán kèm khi dựng màn có tranh, vì quy ước "chấm ở chân công trình" không suy
ra được từ mô tả layout.

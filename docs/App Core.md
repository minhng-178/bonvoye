flowchart TD
    %% Định nghĩa các Style
    classDef screen fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff,font-weight:bold
    classDef logic fill:#f1c40f,stroke:#f39c12,stroke-width:2px,color:#333
    classDef action fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff
    classDef error fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff

    Start(["Mở App BonVoye"]) --> Home["Màn hình Home: Chọn City & Topic"]:::screen
    Home --> MapView["Màn hình Bản đồ (Visual Map)"]:::screen
    
    MapView --> CheckLoc{"Kiểm tra quyền \nLocation"}:::logic
    CheckLoc -- Chưa có --> ReqWhileUsing["Popup: Xin quyền 'While Using'"]:::logic
    ReqWhileUsing -- Từ chối --> AppNoLoc["App vẫn chạy (Chỉ xem Offline/Map)"]:::error
    ReqWhileUsing -- Chấp nhận --> Tracking["Bắt đầu Tracking GPS Thực"]:::action
    CheckLoc -- Đã có --> Tracking
    
    Tracking --> UserAction{"Hành động di chuyển"}:::logic
    
    UserAction -- Di chuyển thực tế --> InRange["Vào vùng Geofence \n(< 50m so với POI)"]:::action
    
    UserAction -- "Kéo màn hình (Fake GPS)" --> FakeGPS{"Kiểm tra khoảng cách"}:::logic
    FakeGPS -- Quá 300m --> Block["Chặn / Báo lỗi đỏ"]:::error
    FakeGPS -- Dưới 300m --> InRange
    
    InRange --> TriggerNPC["Trigger NPC / Mở khóa POI"]:::action
    
    TriggerNPC --> StoryMode{"Chọn chế độ \ntrải nghiệm Story"}:::logic
    StoryMode --> |Đang đi bộ| Audio["Nghe Audio Narration"]:::screen
    StoryMode --> |Đang ngồi nghỉ| Webtoon["Đọc Webtoon 3D/Effect"]:::screen
    
    Audio --> Complete["Hoàn thành POI"]:::action
    Webtoon --> Complete
    
    Complete --> Sync["Lưu Progress ẩn danh/User"]:::logic
    Sync --> Library["Chuyển POI vào mục 'Đã khám phá'"]:::screen
    
    %% Logic reset Fake GPS
    FakeGPS -.-> |"Hết 15p / Rời màn hình / \nĐến nơi thực tế"| ResetGPS["Auto Reset về GPS thực"]:::logic
    ResetGPS -.-> Tracking
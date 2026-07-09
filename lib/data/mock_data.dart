import '../models/country.dart';
import '../models/city.dart';
import '../models/custom_map_overlay.dart';
import '../models/topic.dart';
import '../models/poi.dart';
import '../models/npc.dart';
import '../models/story.dart';
import '../models/hidden_thread.dart';

final List<Country> mockCountries = [
  Country(
    id: 'country_vietnam',
    name: 'Việt Nam',
    description: 'Điểm khởi đầu của BonVoye tại Đông Nam Á.',
    cities: [
      City(
        id: 'city_hanoi',
        name: 'Hà Nội',
        description:
            'Thủ đô ngàn năm văn hiến, nơi lịch sử, truyền thuyết và đời sống '
            'đô thị giao thoa quanh những con phố cổ.',
        // Same point as the default simulated start position (see
        // kDefaultUserLatitude/Longitude) - the plaza at the north end of
        // Hồ Hoàn Kiếm.
        centerLatitude: 21.0325,
        centerLongitude: 105.8524,
        topics: [
          Topic(
            id: 'topic_hanoi_old_quarter',
            title: 'Hồ Gươm Ký Ức',
            description:
                'Khám phá những truyền thuyết cổ xưa và nhịp sống di sản xung quanh hồ Hoàn Kiếm linh thiêng.',
            icon: TopicIcon.autoStories,
            pois: [
              POI(
                id: 'poi_ngoc_son_temple',
                title: 'Đền Ngọc Sơn & Cầu Thê Húc',
                description:
                    'Ngôi đền cổ nằm trên đảo Ngọc thuộc Hồ Hoàn Kiếm, nơi chứng kiến truyền thuyết vua Lê trả gươm và danh sĩ Nguyễn Văn Siêu xây dựng Tháp Bút.',
                latitude: 21.0294,
                longitude: 105.8524,
                imageUrl:
                    'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783496655/%C4%90e%CC%82%CC%80n_Ngo%CC%A3c_So%CC%9Bn_Ca%CC%82%CC%80u_The%CC%82_Hu%CC%81c_jnsowq.jpg',
                // Demo Custom Map Mode wiring: reuses the POI's own photo as a
                // placeholder "hand-drawn map" so the overlay mechanism can be
                // proven end to end - swap `imageUrl` for real cartographic art
                // once it exists. Bounds are a ~70m box around the temple.
                customMapOverlay: const CustomMapOverlay(
                  imageUrl:
                      'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783496655/%C4%90e%CC%82%CC%80n_Ngo%CC%A3c_So%CC%9Bn_Ca%CC%82%CC%80u_The%CC%82_Hu%CC%81c_jnsowq.jpg',
                  northLat: 21.0300,
                  southLat: 21.0288,
                  eastLng: 105.8531,
                  westLng: 105.8517,
                ),
                npcs: [
                  NPC(
                    id: 'npc_than_kim_quy',
                    name: 'Thần Kim Quy',
                    role: 'Hộ Vệ Bảo Kiếm',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783496858/Tha%CC%82%CC%80n_Kim_Quy_ykbl0h.jpg',
                    latitude: 21.0294,
                    longitude: 105.8524,
                    zoneType: ZoneType.legends,
                    poiId: 'poi_ngoc_son_temple',
                    story: Story(
                      id: 'story_kim_quy',
                      title: 'Thanh Gươm Thuận Thiên',
                      content:
                          'Ta đã chờ đợi ở chốn sâu thẳm này hàng trăm năm. Khi vận nước nguy nan, Long Quân đã trao gươm báu Thuận Thiên cho Lê Lợi để dẹp giặc Minh. Giờ đây giặc giã đã tan, ta được lệnh vua Cha hiện lên đòi lại gươm thần, gửi gắm thông điệp về một nền hòa bình trường tồn cho hậu thế.\n\nNhìn bóng rùa lớn nổi lên trên mặt nước xanh biếc, vua Lê hiểu ý chí của thần linh, cúi đầu trao lại bảo kiếm. Từ đó, hồ Tả Vọng mang tên Hồ Hoàn Kiếm - nơi gươm thiêng yên nghỉ.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_turtle_biological',
                          title: 'Hậu duệ rùa khổng lồ cuối cùng',
                          content:
                              'Loài rùa lớn ở hồ Gươm (tên khoa học Rafetus swinhoei) không chỉ là truyền thuyết. Cụ Rùa cuối cùng đã qua đời năm 2016, để lại nỗi tiếc thương vô hạn và khép lại một chương lịch sử huyền thoại đầy bí ẩn.',
                        ),
                        HiddenThread(
                          id: 'thread_le_loi_sword',
                          title: 'Hành trình của thanh gươm từ Thanh Hóa',
                          content:
                              'Thanh gươm báu không tự nhiên xuất hiện. Lưỡi gươm được người đánh cá Lê Thận kéo lên từ lưới sắt ở Thanh Hóa, còn chuôi gươm lại được Lê Lợi nhặt được ở gốc cây cổ thụ. Sự kết hợp hoàn hảo này biểu trưng cho sự đồng lòng của lòng dân và ý trời.',
                        ),
                      ],
                    ),
                  ),
                  NPC(
                    id: 'npc_nguyen_van_sieu',
                    name: 'Nguyễn Văn Siêu',
                    role: 'Thần Siêu - Danh Sĩ Đất Thăng Long',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783496916/Nguye%CC%82%CC%83n_Va%CC%86n_Sie%CC%82u_oog1bu.jpg',
                    latitude: 21.0295,
                    longitude: 105.8525,
                    zoneType: ZoneType.history,
                    poiId: 'poi_ngoc_son_temple',
                    story: Story(
                      id: 'story_van_sieu',
                      title: 'Tháp Bút Tảo Thanh Thiên',
                      content:
                          'Vào năm Tự Đức thứ 19, ta đã chủ trì đợt trùng tu đền Ngọc Sơn. Ta muốn dựng một ngọn tháp đá hình ngọn bút lông chỉ thẳng lên trời xanh, khắc ba chữ "Tảo Thanh Thiên" - nghĩa là viết lên trời trong sáng. Cạnh đó, ta đặt chiếc Đài Nghiên bằng đá hình nửa quả đào được nâng bởi ba con thiềm thừ.\n\nMỗi buổi sớm mai, khi mặt trời lên, bóng của Tháp Bút sẽ nghiêng đúng vào lòng Đài Nghiên, biểu trưng cho sự hòa quyện giữa học thức, đất trời và nhân tâm.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_pen_tower_detail',
                          title: 'Bí ẩn kiến trúc Tháp Bút',
                          content:
                              'Tháp Bút cao 5 tầng, được xây trên gò Độc Tôn đắp bằng đá. Ngọn tháp này tượng trưng cho khí tiết của các nhà nho Thăng Long, những người luôn dùng ngòi bút chân chính để xây dựng đất nước.',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              POI(
                id: 'poi_ly_thai_to_park',
                title: 'Tượng Đài Vua Lý Thái Tổ',
                description:
                    'Khu công viên bên bờ hồ Hoàn Kiếm, nơi đặt tượng đài kỷ niệm vị vua sáng lập kinh thành Thăng Long.',
                latitude: 21.0274,
                longitude: 105.8541,
                imageUrl:
                    'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783496955/Tu%CC%9Bo%CC%9B%CC%A3ng_Ly%CC%81_Tha%CC%81i_To%CC%82%CC%89_b7jgco.jpg',
                npcs: [
                  NPC(
                    id: 'npc_quan_truyen_tin',
                    name: 'Quan Truyền Tin Triều Lý',
                    role: 'Người Đọc Chiếu Dời Đô',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783496955/Tu%CC%9Bo%CC%9B%CC%A3ng_Ly%CC%81_Tha%CC%81i_To%CC%82%CC%89_b7jgco.jpg',
                    latitude: 21.0274,
                    longitude: 105.8541,
                    zoneType: ZoneType.history,
                    poiId: 'poi_ly_thai_to_park',
                    story: Story(
                      id: 'story_chieu_doi_do',
                      title: 'Thiên Đô Chiếu - Khát Vọng Ngàn Năm',
                      content:
                          'Hãy lắng nghe hỡi muôn dân! Hoàng đế Lý Thái Tổ nhận thấy thành Hoa Lư chật hẹp, thế đất không đủ làm chốn định đô lâu dài. Nay Người quyết định dời đô về thành Đại La - chốn hội tụ trọng yếu của bốn phương đất nước, nơi thế đất rồng cuộn hổ ngồi.\n\nKhi thuyền ngự vừa cập bến sông Hồng dưới chân thành, Người bỗng thấy hình ảnh một chú Rồng Vàng bay vút lên trời cao. Điềm lành ứng nghiệm, Đại La được đổi tên thành Thăng Long - kinh đô rực rỡ hướng tới tương lai thịnh vượng.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_thang_long_dragons',
                          title: 'Hình tượng Rồng thời Lý',
                          content:
                              'Rồng thời Lý mang dáng dấp mềm mại như làn nước uốn lượn, không có vảy sừng dữ tợn như rồng các triều đại sau. Nó phản ánh tinh thần Phật giáo ôn hòa và tính cách nông nghiệp lúa nước thanh bình.',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              POI(
                id: 'poi_hoang_thanh_thang_long',
                title: 'Hoàng Thành Thăng Long',
                description:
                    'Quần thể di tích trung tâm quyền lực của Việt Nam qua nhiều triều đại, được UNESCO công nhận Di sản Văn hóa Thế giới. Cùng một tọa độ nhưng có nhiều tầng lịch sử chồng lên nhau - từ khu khảo cổ dưới lòng đất đến Điện Kính Thiên và Kỳ Đài.',
                latitude: 21.0357,
                longitude: 105.8390,
                imageUrl:
                    'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497064/hoang-thanh-thang-long-ha-noi_lqo3gs.jpg',
                npcs: [
                  NPC(
                    id: 'npc_khao_co_ham_moc',
                    name: 'Bà Tư Khảo Cổ',
                    role: 'Người Gác Khu Khảo Cổ',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497909/kha%CC%89o_co%CC%82%CC%89_xqydip_x1l4fz.jpg',
                    latitude: 21.035701,
                    longitude: 105.839002,
                    zoneType: ZoneType.history,
                    poiId: 'poi_hoang_thanh_thang_long',
                    floor: 'Khu khảo cổ dưới lòng đất',
                    story: Story(
                      id: 'story_khao_co_hoang_thanh',
                      title: 'Những Lớp Đất Chồng Chất Ngàn Năm',
                      content:
                          'Năm 2002, khi những nhát cuốc đầu tiên bổ xuống khu đất này để chuẩn bị xây nhà Quốc hội, không ai ngờ lại chạm vào cả một pho sử sống. Từng lớp đất mỏng dưới chân cháu là từng lớp thời gian: móng gạch thời Đại La, giếng nước thời Lý, nền cung điện thời Trần, rồi đến gạch hoa thời Lê sơ.\n\nMỗi lớp đất là một triều đại nói lời riêng của mình. Ta đứng đây canh giữ những mảnh gốm, những viên gạch vỡ ấy, bởi mỗi mảnh vụn đều mang một câu chuyện mà sách vở đôi khi không kể hết.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_khao_co_1300_nam',
                          title: 'Hơn 1300 năm liên tục là trung tâm quyền lực',
                          content:
                              'Khu di tích trung tâm Hoàng thành Thăng Long là minh chứng hiếm có trên thế giới về một địa điểm giữ vai trò trung tâm quyền lực liên tục suốt hơn 13 thế kỷ, từ thời tiền Thăng Long cho đến thời Nguyễn.',
                        ),
                      ],
                    ),
                  ),
                  NPC(
                    id: 'npc_dien_kinh_thien',
                    name: 'Cận Thần Điện Kính Thiên',
                    role: 'Cận Thần Điện Kính Thiên',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497597/%C4%91ie%CC%A3%CC%82n_ki%CC%81nh_thie%CC%82n_bhxk1.webp',
                    latitude: 21.035699,
                    longitude: 105.838999,
                    zoneType: ZoneType.legends,
                    poiId: 'poi_hoang_thanh_thang_long',
                    floor: 'Điện Kính Thiên',
                    story: Story(
                      id: 'story_dien_kinh_thien',
                      title: 'Thềm Rồng Trước Điện Thiết Triều',
                      content:
                          'Đây từng là chính điện - nơi thiết triều, nơi cử hành các nghi lễ quan trọng nhất của quốc gia. Điện đã không còn nguyên vẹn, nhưng đôi rồng đá chạm trên thềm bậc vẫn uy nghi như thuở nào, mình rồng uốn lượn mềm mại mà vẫn toát lên khí phách đế vương.\n\nMỗi khi có sứ thần ngoại bang đến chầu, họ đều phải dừng bước trước thềm rồng này mà cúi đầu. Đá vô tri, nhưng khắc ghi cả một thời oanh liệt của Thăng Long - Hà Nội.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_them_rong_le',
                          title: 'Đôi rồng đá thời Lê sơ',
                          content:
                              'Thềm rồng Điện Kính Thiên được tạo tác vào thế kỷ 15 thời Lê sơ, là một trong những hiện vật điêu khắc đá quý giá bậc nhất còn lại của kinh thành Thăng Long xưa.',
                        ),
                      ],
                    ),
                  ),
                  NPC(
                    id: 'npc_ky_dai',
                    name: 'Người Lính Gác Cờ',
                    role: 'Người Lính Gác Cờ',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497368/li%CC%81nh_ga%CC%81c_co%CC%9B%CC%80_esgxa2.jpg',
                    latitude: 21.035698,
                    longitude: 105.839001,
                    zoneType: ZoneType.scenicSpot,
                    poiId: 'poi_hoang_thanh_thang_long',
                    floor: 'Kỳ Đài',
                    story: Story(
                      id: 'story_ky_dai',
                      title: 'Ngọn Cờ Trên Đỉnh Cột Cờ Hà Nội',
                      content:
                          'Ta đứng gác ở đây, trên đỉnh Kỳ Đài cao hơn 33 mét này, nhìn được cả một góc trời Hà Nội. Cột cờ được xây từ thời Nguyễn, nhưng nó chứng kiến biết bao thăng trầm - từ những ngày thực dân chiếm đóng cho đến buổi sáng mùa thu năm 1954 khi lá cờ đỏ sao vàng lần đầu tung bay trên đỉnh cột sau ngày giải phóng Thủ đô.\n\nGió trên này lúc nào cũng lộng, như thể đất trời vẫn còn nhắc mãi câu chuyện của những người đã ngã xuống vì mảnh đất này.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_ky_dai_giai_phong',
                          title: 'Ngày giải phóng Thủ đô 10/10/1954',
                          content:
                              'Sáng ngày 10/10/1954, lễ thượng cờ trọng thể được tổ chức tại sân Cột Cờ Hà Nội, đánh dấu thời khắc thủ đô hoàn toàn được giải phóng sau 9 năm kháng chiến chống Pháp.',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              POI(
                id: 'poi_dong_xuan_market',
                title: 'Chợ Đồng Xuân',
                description:
                    'Ngôi chợ sầm uất và lâu đời nhất Hà Nội, biểu tượng thương mại và văn hóa của đất Hà Thành.',
                latitude: 21.0371,
                longitude: 105.8497,
                imageUrl:
                    'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497171/cho-dong-xuan-0_1673837980_txysql.webp',
                npcs: [
                  NPC(
                    id: 'npc_co_ba_bun_rieu',
                    name: 'Cô Ba Hàng Bún',
                    role: 'Người Giữ Lửa Vị Phố Cổ',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497754/co%CC%82_ba_ha%CC%80ng_bu%CC%81n_mtucrp.jpg',
                    latitude: 21.0371,
                    longitude: 105.8497,
                    zoneType: ZoneType.localLife,
                    poiId: 'poi_dong_xuan_market',
                    story: Story(
                      id: 'story_bun_rieu',
                      title: 'Hương Vị Đồng Quê Giữa Lòng Phố Thị',
                      content:
                          'Gánh hàng bún riêu này nhà cô truyền ba đời rồi cháu ơi. Riêu cua phải giã tay thật kỹ, phi hành mỡ thơm phức rồi thêm giấm bỗng nếp cho vị chua thanh mát dịu. Bún phải là bún sợi nhỏ thanh mảnh của làng Phú Đô. \n\nMỗi tô bún nóng hổi bốc khói nghi ngút là cả một ký ức của Hà Nội xưa cũ. Nhìn những gánh hàng nhỏ nằm lặng lẽ bên hông chợ Đồng Xuân này, cháu sẽ thấy nhịp thở ẩm thực thanh nhã chẳng hề phai mờ theo tháng năm.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_giem_bong',
                          title: 'Bí thuật giấm bỗng nếp Hà Nội',
                          content:
                              'Giấm bỗng là sản phẩm phụ của quá trình nấu rượu nếp cái hoa vàng. Vị chua dịu, thơm nồng đượm đà của giấm bỗng chính là "chìa khóa vàng" giúp nồi bún riêu cua Hà Nội không bị tanh và có hậu vị ngọt hậu.',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              POI(
                id: 'poi_ta_hien_building',
                title: 'Lầu Cà Phê Tạ Hiện',
                description:
                    'Căn nhà ống 5 tầng trên phố Tạ Hiện, mỗi lầu là một lát cắt khác nhau của đời sống phố cổ - từ quán cà phê trứng tầng trệt đến sân thượng ngắm mái ngói rêu phong.',
                latitude: 21.0345,
                longitude: 105.8508,
                imageUrl:
                    'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497171/cho-dong-xuan-0_1673837980_txysql.webp',
                npcs: [
                  NPC(
                    id: 'npc_ta_hien_tang_tret',
                    name: 'Chú Sáu Cà Phê Trứng',
                    role: 'Chủ Quán Tầng Trệt',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497754/co%CC%82_ba_ha%CC%80ng_bu%CC%81n_mtucrp.jpg',
                    latitude: 21.034501,
                    longitude: 105.850799,
                    zoneType: ZoneType.localLife,
                    poiId: 'poi_ta_hien_building',
                    floor: 'Tầng 1 - Quán Cà Phê Trứng',
                    story: Story(
                      id: 'story_ta_hien_tang_tret',
                      title: 'Bọt Trứng Đánh Bông Giữa Lòng Phố Cổ',
                      content:
                          'Chú pha cà phê trứng ở góc này đã hơn hai mươi năm rồi cháu ạ. Lòng đỏ trứng gà phải đánh bông cùng sữa đặc và chút cà phê cho tới khi mịn như kem, rồi mới rót cà phê phin nóng hổi lên trên.\n\nKhách ngồi ở tầng trệt này toàn là người quen cả, sáng nào cũng ghé qua ngồi một lúc trước khi đi làm, như một nghi thức nhỏ giữ nhịp sống phố cổ.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_ca_phe_trung_origin',
                          title: 'Nguồn gốc cà phê trứng Hà Nội',
                          content:
                              'Cà phê trứng ra đời vào thập niên 1940 tại khách sạn Sofitel Legend Metropole, khi thiếu sữa tươi, người pha chế đã dùng lòng đỏ trứng gà đánh bông thay thế, tạo nên món uống đặc trưng của Hà Nội.',
                        ),
                      ],
                    ),
                  ),
                  NPC(
                    id: 'npc_ta_hien_tang_hai',
                    name: 'Chị Lan May Áo Dài',
                    role: 'Thợ May Tầng Hai',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783497909/kha%CC%89o_co%CC%82%CC%89_xqydip_x1l4fz.jpg',
                    latitude: 21.034499,
                    longitude: 105.850801,
                    zoneType: ZoneType.history,
                    poiId: 'poi_ta_hien_building',
                    floor: 'Tầng 2 - Tiệm May Áo Dài',
                    story: Story(
                      id: 'story_ta_hien_tang_hai',
                      title: 'Đường Kim Mũi Chỉ Giữ Nếp Xưa',
                      content:
                          'Chị học nghề may áo dài từ mẹ, rồi mẹ chị học từ bà ngoại. Mỗi chiếc áo dài ra khỏi tầng này đều được đo tay, cắt tay, không qua khuôn mẫu công nghiệp.\n\nKhách đến đây phần nhiều là các cô muốn có một chiếc áo dài mặc Tết, ngồi chờ trên chiếc ghế gỗ cũ kỹ trong lúc chị đo ni, nghe chị kể chuyện phố xưa.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_ao_dai_history',
                          title: 'Áo dài qua các thời kỳ',
                          content:
                              'Form dáng áo dài hiện đại được định hình rõ nét từ những năm 1930 qua các cải cách của họa sĩ Cát Tường (Le Mur), thu gọn tà áo và ôm sát cơ thể hơn so với áo tứ thân truyền thống.',
                        ),
                      ],
                    ),
                  ),
                  NPC(
                    id: 'npc_ta_hien_tang_ba',
                    name: 'Bác Hùng Sửa Đồng Hồ',
                    role: 'Thợ Sửa Đồng Hồ Tầng Ba',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783504589/su%CC%9B%CC%89a_%C4%91o%CC%82%CC%80ng_ho%CC%82%CC%80_wdghfa.jpg',
                    latitude: 21.034503,
                    longitude: 105.850797,
                    zoneType: ZoneType.localLife,
                    poiId: 'poi_ta_hien_building',
                    floor: 'Tầng 3 - Xưởng Sửa Đồng Hồ',
                    story: Story(
                      id: 'story_ta_hien_tang_ba',
                      title: 'Chiếc Đồng Hồ Dừng Lại Năm 1972',
                      content:
                          'Bác giữ chiếc đồng hồ này trong tủ kính đã bốn mươi năm, không bán, không sửa. Kim đồng hồ dừng đúng lúc còi báo động vang lên đêm Điện Biên Phủ trên không.\n\nNgười chủ cũ gửi lại cho bác trước khi đi sơ tán, dặn giữ hộ, rồi không bao giờ quay lại nhận. Bác vẫn lên dây cót cho nó chạy mỗi tháng một lần, như một lời hẹn còn dang dở.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_dien_bien_phu_khong',
                          title: 'Điện Biên Phủ trên không',
                          content:
                              'Cuối tháng 12/1972, Hà Nội hứng chịu 12 ngày đêm oanh tạc bằng B-52 của không quân Mỹ. Chiến thắng phòng không của quân dân Hà Nội trong chiến dịch này được gọi là "Điện Biên Phủ trên không".',
                        ),
                      ],
                    ),
                  ),
                  NPC(
                    id: 'npc_ta_hien_san_thuong',
                    name: 'Cậu Tùng Chủ Quán Bar Sân Thượng',
                    role: 'Chủ Quán Bar Sân Thượng',
                    avatarUrl:
                        'https://res.cloudinary.com/dqqfmuomk/image/upload/v1783504461/bar_bbbjmj.jpg',
                    latitude: 21.034497,
                    longitude: 105.850803,
                    zoneType: ZoneType.scenicSpot,
                    poiId: 'poi_ta_hien_building',
                    floor: 'Sân Thượng - Quán Bar Ngắm Cảnh',
                    story: Story(
                      id: 'story_ta_hien_san_thuong',
                      title: 'Nhìn Xuống Mái Ngói Rêu Phong',
                      content:
                          'Từ sân thượng này, cậu nhìn được cả một biển mái ngói cũ nghiêng nghiêng của khu phố cổ, xen giữa là những cây bàng già và dây điện chằng chịt như mạng nhện.\n\nBuổi tối quán mở nhạc nhẹ, khách ngồi đây vừa uống bia hơi vừa ngắm hoàng hôn buông xuống nóc những ngôi nhà trăm tuổi, một góc nhìn mà dưới mặt đất không bao giờ thấy được.',
                      hiddenThreads: [
                        HiddenThread(
                          id: 'thread_pho_co_kien_truc',
                          title: 'Kiến trúc nhà ống phố cổ',
                          content:
                              'Nhà ống phố cổ Hà Nội đặc trưng bởi mặt tiền hẹp, chiều sâu lớn, do thuế thời phong kiến đánh theo chiều rộng mặt phố. Nhiều nhà có tới 4-5 tầng cùng giếng trời để lấy sáng và thông gió.',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
];

# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## DỰ ÁN: SQL HUB - NỀN TẢNG HỌC VÀ THỰC HÀNH SQL TRỰC TUYẾN
**Phiên bản:** 3.0 (Tinh gọn & Chuẩn hóa thực tế)  
**Ngày cập nhật:** 27/10/2026  
**Công nghệ chính:** Next.js (React), NestJS, PostgreSQL, TypeORM, Monaco Editor / PGlite

---

## 1. GIỚI THIỆU TỔNG QUAN

### 1.1 Mục đích
Tài liệu này xác định các yêu cầu chức năng, yêu cầu phi chức năng, kiến trúc kỹ thuật và mô hình dữ liệu cho hệ thống **SQL Hub**. Đây là nền tảng học tập tương tác giúp người học tiếp cận và rèn luyện kỹ năng SQL từ cơ bản đến nâng cao thông qua:
1. **Bài giảng lý thuyết trực quan:** Soạn thảo bằng Markdown, hiển thị khối mã SQL tô sáng cú pháp.
2. **Trắc nghiệm củng cố nhanh:** Kiểm tra nhanh mức độ hiểu bài sau mỗi bài học lý thuyết.
3. **Phòng thực hành SQL tương tác (Interactive SQL Sandbox):** Soạn thảo truy vấn bằng Monaco Editor, thực thi trên CSDL mẫu và tự động chấm điểm theo kết quả mong đợi.
4. **Trợ lý AI hỗ trợ học viên:** Phân tích nguyên nhân lỗi truy vấn và gợi ý hướng tư duy khắc phục (không giải hộ).

### 1.2 Phạm vi sản phẩm (Scope)
- **Đối tượng người dùng:**
  - **Học viên (Learner):** Đăng nhập, xem lộ trình học, đọc bài giảng, làm trắc nghiệm, viết truy vấn SQL trong Sandbox, xem kết quả dạng bảng, nộp bài chấm tự động, theo dõi tiến độ hoàn thành, yêu cầu AI giải thích lỗi.
  - **Quản trị viên (Admin):** Quản lý khóa học, bài học, bộ câu hỏi trắc nghiệm, bài thực hành Lab, quản lý dataset dữ liệu mẫu và theo dõi thống kê học tập.
- **Phạm vi kỹ thuật trong giai đoạn này (6 - 8 tuần):**
  - Web Application responsive trên Desktop và Mobile.
  - Trọng tâm bài thực hành: Các truy vấn trích xuất dữ liệu (`SELECT`, `WHERE`, `JOIN`, `GROUP BY`, `HAVING`, `Subquery`, `Window Functions`, `CTE`).

### 1.3 Giới hạn ngoài phạm vi (Out of Scope)
Các tính năng sau **không** triển khai trong giai đoạn hiện tại để tránh phân tán nguồn lực:
- Hệ thống cổng thanh toán trực tuyến và các gói hội viên trả phí.
- Ứng dụng di động độc lập (Native Mobile App) — chỉ cần Web Responsive.
- Chạy các câu lệnh can thiệp hệ thống hoặc phá hủy (`DROP DATABASE`, `GRANT`, `SHUTDOWN`, lệnh shell OS).
- Diễn đàn cộng đồng hoặc mạng xã hội học viên.
- Cấp chứng chỉ số xác thực bằng chữ ký điện tử.

---

## 2. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ

### 2.1 Công nghệ sử dụng
- **Frontend (Next.js + TypeScript):**
  - Framework: Next.js (App Router, React 19).
  - UI Library: Tailwind CSS + shadcn/ui (hỗ trợ Light / Dark mode).
  - Trình soạn thảo SQL: Monaco Editor hoặc CodeMirror 6 (hỗ trợ syntax highlight, auto-indent, format).
  - Quản lý trạng thái & API: TanStack Query (React Query) + React Hook Form + Zod.
  - Đa ngôn ngữ UI: `next-intl` hoặc `i18next` (hỗ trợ chuyển đổi giao diện vi / en).
  - SQL Sandbox Client (tùy chọn tối ưu): PGlite (PostgreSQL WASM chạy in-browser).
- **Backend (NestJS + TypeScript):**
  - Framework: NestJS (Modular Architecture).
  - CSDL & ORM: PostgreSQL + TypeORM (hỗ trợ Migration và Data Seeding).
  - Tài liệu API: OpenAPI / Swagger (`/api/docs`).
  - Cơ chế Auth: JWT (Access Token gửi qua header `Authorization: Bearer <token>`, có Refresh Token).
- **Hạ tầng:**
  - Docker Compose cho môi trường phát triển (PostgreSQL, Backend, Frontend).

### 2.2 Cơ chế Chạy và Chấm bài SQL (Dual Sandbox)
Hệ thống sử dụng cơ chế **Sandbox Kép** để tối ưu hóa trải nghiệm người dùng và an toàn máy chủ:
1. **Chế độ Chạy thử nghiệm (Run Query):**
   - Chạy trực tiếp trên trình duyệt bằng **PGlite** (Postgres WebAssembly) nạp sẵn dataset của bài lab.
   - *Ưu điểm:* Tốc độ phản hồi tức thì (< 50ms), không tốn tài nguyên server backend, học viên tự do chạy thử nhiều lần.
2. **Chế độ Nộp bài chấm điểm (Submit Query):**
   - Query được gửi về Backend NestJS.
   - Backend thực thi query của học viên trong một kết nối Read-Only riêng biệt trên CSDL Sandbox (timeout 3s, giới hạn tối đa 500 dòng).
   - So sánh tập kết quả (`result set`) của học viên với kết quả của `solution_query` chuẩn (so sánh số dòng, tên cột và giá trị từng ô; không so sánh chuỗi code thô).
   - Trả về: `PASSED` (Đạt) hoặc `FAILED` (Kèm lý do: sai số dòng, sai giá trị, lỗi runtime).

---

## 3. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 3.1 Nhóm Xác thực & Tài khoản (FR-AUTH)
| Mã | Tên yêu cầu | Chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **FR-AUTH-01** | Đăng nhập & Đăng ký | Đăng nhập bằng Email/Mật khẩu hoặc Google OAuth 2.0. | P1 |
| **FR-AUTH-02** | Quản lý phiên JWT | Access Token (15-60 phút) gửi qua header Bearer, có Refresh Token tự động gia hạn. | P1 |
| **FR-AUTH-03** | Đăng xuất | Hủy phiên đăng nhập và xóa token lưu trữ ở client. | P1 |
| **FR-AUTH-04** | Hồ sơ người dùng | Xem và cập nhật họ tên, ảnh đại diện, đổi mật khẩu. | P2 |

### 3.2 Nhóm Khóa học & Bài học (FR-LESSON)
| Mã | Tên yêu cầu | Chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **FR-LESSON-01** | Lộ trình khóa học | Danh sách khóa học theo cấp độ (Cơ bản -> Nâng cao). Mỗi khóa gồm danh sách bài học theo thứ tự. | P1 |
| **FR-LESSON-02** | Xem bài học Markdown | Trình bày lý thuyết với định dạng Markdown chuẩn, khối code SQL tô màu cú pháp và có nút copy. | P1 |
| **FR-LESSON-03** | Đánh dấu hoàn thành | Tự động hoặc người dùng nhấn hoàn thành để ghi nhận % tiến độ khóa học. | P1 |
| **FR-LESSON-04** | Tìm kiếm bài học | Tìm nhanh bài học theo tiêu đề hoặc từ khóa cú pháp SQL. | P2 |

### 3.3 Nhóm Trắc nghiệm nhanh (FR-QUIZ)
| Mã | Tên yêu cầu | Chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **FR-QUIZ-01** | Làm bài trắc nghiệm | Mỗi bài học có bộ 3 - 5 câu trắc nghiệm (1 đáp án đúng). | P1 |
| **FR-QUIZ-02** | Chấm điểm & Giải thích | Báo kết quả đúng/sai ngay lập tức kèm lời giải thích chi tiết. | P1 |
| **FR-QUIZ-03** | Lưu kết quả làm bài | Ghi nhận trạng thái hoàn thành và điểm số cao nhất của học viên. | P2 |

### 3.4 Nhóm Thực hành Lab SQL & Sandbox (FR-LAB)
| Mã | Tên yêu cầu | Chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **FR-LAB-01** | Giao diện phòng Lab | Bố cục 3 phần trực quan: Đề bài & Cấu trúc bảng mẫu; Trình soạn thảo Monaco SQL; Bảng hiển thị kết quả truy vấn. | P1 |
| **FR-LAB-02** | Chạy thử câu truy vấn | Nút **"Chạy thử"**: Thực thi câu lệnh SQL, hiển thị kết quả dạng bảng lưới (grid) hoặc thông báo lỗi cú pháp. | P1 |
| **FR-LAB-03** | Nộp bài & Chấm tự động | Nút **"Nộp bài"**: Gửi query lên backend, so sánh tập kết quả với đáp án chuẩn, trả về Đạt/Chưa đạt. | P1 |
| **FR-LAB-04** | Giới hạn an toàn | Chỉ cho phép thực thi câu lệnh đọc dữ liệu (`SELECT`). Giới hạn thời gian chạy tối đa 3 giây, tối đa 500 dòng hiển thị. | P1 |
| **FR-LAB-05** | Gợi ý từng bước (Hint) | Xem gợi ý tư duy khi gặp bế tắc (không lộ câu lệnh đáp án). | P2 |
| **FR-LAB-06** | Lưu nháp mã truy vấn | Tự động lưu bản nháp code gần nhất của học viên. | P2 |

### 3.5 Nhóm Trợ lý AI (FR-AI - Tính năng nổi bật)
| Mã | Tên yêu cầu | Chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **FR-AI-01** | Giải thích lỗi SQL | Nút "Nhờ AI giải thích" khi gặp lỗi: AI chỉ ra nguyên nhân cú pháp và cách khắc phục ngắn gọn. | P2 |
| **FR-AI-02** | Gợi ý tư duy logic | Khi kết quả query sai với đề bài, AI chỉ ra điểm thiếu sót trong logic (VD: thiếu điều kiện `WHERE`, sai hàm tổng hợp) mà KHÔNG viết hộ câu lệnh hoàn chỉnh. | P2 |
| **FR-AI-03** | Rate Limit AI | Giới hạn 20 lượt hỏi/người dùng/ngày để kiểm soát chi phí API. | P2 |

### 3.6 Nhóm Quản trị Admin (FR-ADMIN)
| Mã | Tên yêu cầu | Chi tiết | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **FR-ADMIN-01** | Phân quyền Admin | Chỉ tài khoản có quyền `ADMIN` mới được truy cập `/admin-panel`. | P1 |
| **FR-ADMIN-02** | Quản lý Khóa & Bài học | Thêm, sửa, xóa khóa học, chương và nội dung bài học. | P1 |
| **FR-ADMIN-03** | Quản lý Lab & Dataset | Thêm, sửa bài thực hành, cấu hình Dataset mẫu (DDL + INSERT) và câu truy vấn mẫu (`solution_query`). | P1 |
| **FR-ADMIN-04** | Thống kê cơ bản | Xem số lượng học viên, số lượt hoàn thành bài học và bài lab. | P2 |

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

- **NFR-01 (Hiệu năng):** Thời gian tải trang ban đầu < 2.5s. Thời gian chạy thử truy vấn in-browser < 100ms. API backend phản hồi trung bình < 400ms.
- **NFR-02 (Bảo mật Sandbox):** Cấm chạy lệnh DDL/DML làm thay đổi CSDL máy chủ. Kết nối Sandbox chấm bài ở backend bắt buộc cấu hình quyền Read-Only và timeout tối đa 3 giây.
- **NFR-03 (Bảo mật thông tin):** Khóa API, mật khẩu CSDL nằm trong biến môi trường `.env`. Token xác thực được kiểm tra chặt chẽ trên toàn bộ các route được bảo vệ.
- **NFR-04 (Giao diện & Trải nghiệm):** Tối ưu hiển thị responsive trên các kích thước màn hình máy tính và thiết bị bảng. Hỗ trợ đầy đủ chế độ Light / Dark mode.
- **NFR-05 (Chất lượng mã):** Tuân thủ tiêu chuẩn TypeScript strict, ESLint, Prettier. Cấu trúc mã rõ ràng theo mô hình phân lớp.

---

## 5. THIẾT KẾ CƠ SỞ DỮ LIỆU TINH GỌN (SIMPLIFIED ERD)

Loại bỏ các bảng translation phụ rườm rà, tập trung vào mô hình dữ liệu trực quan:

```
+----------------+       +-------------------+       +-----------------------+
|     users      |       |      courses      |       |       datasets        |
+----------------+       +-------------------+       +-----------------------+
| id (PK)        |       | id (PK)           |       | id (PK)               |
| email          |       | slug              |       | name                  |
| password_hash  |       | title             |       | description           |
| full_name      |       | description       |       | schema_ddl            |
| role           |       | order_index       |       | seed_sql              |
| avatar_url     |       | is_published      |       +-----------------------+
+-------+--------+       +---------+---------+                   |
        |                          |                             |
        |                          v                             |
        |                +-------------------+                   |
        |                |      lessons      |                   |
        |                +-------------------+                   |
        |                | id (PK)           |                   |
        |                | course_id (FK)    |                   |
        |                | slug              |                   |
        |                | title             |                   |
        |                | content_markdown  |                   |
        |                | order_index       |                   |
        |                +----+---------+----+                   |
        |                     |         |                        |
        v                     v         +----------+             v
+------------------+   +------------+              |   +--------------------+
|  user_progress   |   |  quizzes   |              +-->|        labs        |
+------------------+   +------------+                  +--------------------+
| id (PK)          |   | id (PK)    |                  | id (PK)            |
| user_id (FK)     |   | lesson_id  |                  | lesson_id (FK)     |
| lesson_id (FK)   |   | question   |                  | dataset_id (FK)    |
| is_completed     |   | options    |                  | title              |
| completed_at     |   | correct_key|                  | instruction        |
+------------------+   | explanation|                  | hint               |
                       +------------+                  | initial_sql        |
                                                       | solution_query     |
                                                       | order_sensitive    |
                                                       +---------+----------+
                                                                 |
                                                                 v
                                                       +--------------------+
                                                       |  lab_submissions   |
                                                       +--------------------+
                                                       | id (PK)            |
                                                       | user_id (FK)       |
                                                       | lab_id (FK)        |
                                                       | submitted_query    |
                                                       | is_passed          |
                                                       | execution_time_ms  |
                                                       | created_at         |
                                                       +--------------------+
```

---

## 6. DANH SÁCH API CỐT LÕI (RESTFUL APIS)

Tiền tố chung: `/api/v1`

### 6.1 Xác thực & Người dùng (Auth & Users)
- `POST /api/v1/auth/email/login`: Đăng nhập email & mật khẩu.
- `POST /api/v1/auth/email/register`: Đăng ký tài khoản.
- `POST /api/v1/auth/refresh`: Làm mới token.
- `GET /api/v1/auth/me`: Lấy thông tin user hiện tại.

### 6.2 Khóa học & Bài học (Courses & Lessons)
- `GET /api/v1/courses`: Danh sách khóa học hiển thị công khai.
- `GET /api/v1/courses/:slug`: Chi tiết khóa học và danh sách bài học.
- `GET /api/v1/lessons/:id`: Nội dung bài học (Markdown, lab và quiz liên quan).
- `POST /api/v1/lessons/:id/complete`: Đánh dấu hoàn thành bài học.

### 6.3 Trắc nghiệm (Quiz)
- `GET /api/v1/lessons/:id/quizzes`: Lấy danh sách câu hỏi trắc nghiệm của bài học.
- `POST /api/v1/quizzes/:id/submit`: Nộp câu trả lời, nhận kết quả và giải thích.

### 6.4 Lab & Chấm điểm (Labs)
- `GET /api/v1/labs/:id`: Chi tiết bài lab, schema dataset mẫu, code khởi tạo.
- `POST /api/v1/labs/:id/run`: (Tùy chọn) Chạy truy vấn SQL trên server.
- `POST /api/v1/labs/:id/submit`: Chấm điểm câu truy vấn nộp, so sánh kết quả và ghi nhận lịch sử đạt/chưa đạt.

### 6.5 Trợ lý AI (AI Assistant)
- `POST /api/v1/ai/explain`: Gửi câu truy vấn và thông báo lỗi, nhận phản hồi giải thích và định hướng từ AI.

### 6.6 Quản trị (Admin)
- `CRUD /api/v1/admin/courses`: Quản lý danh mục khóa học.
- `CRUD /api/v1/admin/lessons`: Quản lý nội dung bài học.
- `CRUD /api/v1/admin/labs`: Quản lý bài tập thực hành.
- `CRUD /api/v1/admin/datasets`: Quản lý dataset dữ liệu mẫu.
- `GET /api/v1/admin/analytics`: Số liệu thống kê người học và tỷ lệ hoàn thành.

---

## 7. KẾ HOẠCH TRIỂN KHAI THEO GIAI ĐOẠN (ROADMAP)

| Giai đoạn | Thời lượng | Trọng tâm công việc | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Pha 1: Khung & CSDL** | Tuần 1 | Khởi tạo cấu trúc frontend/backend, cấu hình TypeORM Migration, Seed dữ liệu mẫu khóa học và bài lab đầu tiên. Cắt bỏ các module thừa từ boilerplate. | Chạy được toàn bộ hệ thống bằng Docker, đăng nhập hoạt động, API Swagger sẵn sàng. |
| **Pha 2: Bài học & Trắc nghiệm** | Tuần 2 - 3 | Xây dựng giao diện Danh sách khóa học, xem bài học Markdown, làm bài trắc nghiệm và theo dõi tiến độ hoàn thành. | Học viên xem được bài học và làm trắc nghiệm lưu kết quả. |
| **Pha 3: SQL Lab & Sandbox** | Tuần 4 - 5 | Tích hợp Monaco Editor, cơ chế chạy truy vấn thử nghiệm (PGlite) và bộ máy chấm bài đối chiếu kết quả ở backend. Tích hợp API Trợ lý AI giải thích lỗi. | Học viên thực hành viết truy vấn, nộp bài chấm tự động Đạt/Chưa đạt và nhận trợ giúp từ AI. |
| **Pha 4: Quản trị & Hoàn thiện** | Tuần 6 | Hoàn thiện trang quản trị Admin CRUD bài học & Lab, kiểm thử bảo mật sandbox, tinh chỉnh giao diện responsive và chuẩn bị tài liệu báo cáo. | Bản demo hoàn chỉnh, ổn định để nghiệm thu. |

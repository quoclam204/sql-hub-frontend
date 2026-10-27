# SQL Hub - Frontend

> **SQL Hub** là nền tảng học tập và thực hành SQL trực tuyến tương tác, cung cấp lộ trình từ cơ bản đến nâng cao với bài giảng Markdown, bài tập trắc nghiệm củng cố, phòng thực hành truy vấn SQL tương tác và trợ lý AI giải thích lỗi.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-black)](https://ui.shadcn.com/)

---

## 📖 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Bắt đầu nhanh (Getting Started)](#-bắt-đầu-nhanh-getting-started)
- [Các lệnh thường dùng (Scripts)](#-các-lệnh-thường-dùng-scripts)
- [Tài liệu liên quan](#-tài-liệu-liên-quan)

---

## 🌟 Giới thiệu

Repo này chứa mã nguồn **Frontend** của dự án **SQL Hub**, được xây dựng trên nền tảng Next.js (App Router) với kiến trúc hiện đại, hiệu năng cao và giao diện thân thiện:
- **Người học (Learner):** Trải nghiệm học lý thuyết đi kèm thực hành ngay trên cùng một màn hình; viết câu lệnh SQL, xem kết quả dạng bảng tức thì và nhận phản hồi chấm điểm tự động.
- **Quản trị viên (Admin):** Quản lý khóa học, bài học, bộ câu hỏi trắc nghiệm, dataset dữ liệu mẫu và các bài lab thực hành.

---

## 🚀 Tính năng chính

- [x] **Lộ trình bài giảng chuẩn hóa:** Hỗ trợ hiển thị nội dung Markdown trực quan với khối mã SQL tô màu cú pháp.
- [x] **Phòng thực hành SQL Lab:**
  - Trình soạn thảo mã SQL chuyên nghiệp (Monaco Editor / CodeMirror) hỗ trợ gợi ý cú pháp, tự động thụt dòng.
  - Chạy thử nghiệm truy vấn trực tiếp với phản hồi dạng bảng dữ liệu lưới (Grid).
  - Nộp bài và tự động chấm điểm đối chiếu kết quả mong đợi.
- [x] **Trắc nghiệm nhanh (Quiz):** Kiểm tra củng cố kiến thức cuối mỗi bài giảng với phản hồi giải thích chi tiết.
- [x] **Trợ lý AI hỗ trợ:** Phân tích nguyên nhân lỗi cú pháp SQL và gợi ý hướng tư duy khắc phục (không giải hộ đáp án).
- [x] **Giao diện đa ngôn ngữ (i18n):** Hỗ trợ Tiếng Việt (`/vi`) và Tiếng Anh (`/en`).
- [x] **Giao diện hiện đại:** Xây dựng bằng Tailwind CSS và shadcn/ui, hỗ trợ đầy đủ Dark / Light mode.
- [x] **Xác thực người dùng:** Đăng nhập, đăng ký tài khoản (Email/Password & Google OAuth) và quản lý phiên JWT.

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Ngôn ngữ** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Giao diện** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) |
| **Quản lý dữ liệu & Cache** | [TanStack Query v5](https://tanstack.com/query) (React Query) |
| **Quản lý Form & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Đa ngôn ngữ (i18n)** | [i18next](https://www.i18next.com/), `i18next-browser-languagedetector` |
| **Code Editor** | Monaco Editor / CodeMirror |
| **Kiểm thử** | [Playwright](https://playwright.dev/) (E2E Tests), ESLint, Prettier |

---

## 📂 Cấu trúc thư mục

```txt
sql-hub-frontend/
├── docs/                   # Tài liệu kỹ thuật dự án (SRS, kiến trúc, hướng dẫn)
│   ├── SRS-SQLHub.md       # Đặc tả yêu cầu phần mềm (SRS v3.0)
│   └── architecture.md     # Tài liệu kiến trúc
├── playwright-tests/       # Kịch bản kiểm thử E2E
├── public/                 # Tài nguyên tĩnh (ảnh, icon, fonts)
└── src/
    ├── app/
    │   └── [language]/     # Routing theo ngôn ngữ (/vi, /en)
    │       ├── (auth)/     # Các trang đăng nhập, đăng ký
    │       ├── admin-panel/# Trang quản trị dành cho Admin
    │       ├── courses/    # Danh sách khóa học và bài học
    │       ├── labs/       # Phòng thực hành SQL Lab tương tác
    │       ├── profile/    # Trang hồ sơ cá nhân
    │       └── page.tsx    # Trang chủ Landing Page
    ├── components/         # Các UI component dùng chung (Button, Table, Form, Dialog...)
    │   ├── ui/             # shadcn/ui primitives
    │   └── sql-editor/     # Trình soạn thảo và chạy SQL
    ├── hooks/              # Custom React Hooks
    ├── lib/                # Cấu hình tiện ích (utils, formatters)
    ├── services/           # Xử lý API, Auth, React Query, i18n
    │   ├── api/            # API client và endpoints
    │   ├── auth/           # Context & xử lý phiên đăng nhập
    │   └── i18n/           # Từ điển đa ngôn ngữ (vi, en)
    └── types/              # Khai báo TypeScript types / interfaces
```

---

## 💻 Bắt đầu nhanh (Getting Started)

### 1. Yêu cầu môi trường
- **Node.js:** phiên bản `>= 20.x`
- **npm:** phiên bản `>= 10.x`

### 2. Thiết lập biến môi trường
Tạo file cấu hình môi trường `.env.local` từ file mẫu:

```bash
cp example.env.local .env.local
```

Cấu hình các tham số chính trong `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_IS_SIGN_UP_ENABLED=true
NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Cài đặt dependencies
```bash
npm install
```

### 4. Khởi chạy máy chủ phát triển
```bash
npm run dev
```

Mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## 📜 Các lệnh thường dùng (Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Khởi chạy server phát triển với Turbopack |
| `npm run build` | Đóng gói ứng dụng cho môi trường production |
| `npm run start` | Chạy ứng dụng đã đóng gói trên production |
| `npm run lint` | Kiểm tra cú pháp và chất lượng mã nguồn với ESLint |
| `npm run lint:fix` | Tự động sửa các lỗi linting có thể |
| `npm run generate:resource` | Sinh nhanh CRUD resource cho Admin Panel bằng Hygen CLI |
| `npm run generate:field` | Bổ sung trường dữ liệu vào resource bằng Hygen CLI |

---

## 📚 Tài liệu liên quan

- **Tài liệu đặc tả yêu cầu (SRS v3.0):** [docs/SRS-SQLHub.md](docs/SRS-SQLHub.md)
- **Tài liệu kiến trúc hệ thống:** [docs/architecture.md](docs/architecture.md)
- **Backend Repository:** [sql-hub-backend](https://github.com/quoclam204/sql-hub-backend)

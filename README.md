# So sánh căn hộ thuê

Web app mobile-first để ghi nhận căn hộ đang xem, tính chi phí cư dân, chấm điểm có trọng số và so sánh cạnh nhau. Stack: **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Prisma + Supabase (Auth + Postgres + Storage)**.

## Tính năng

- CRUD căn hộ (thông tin, giá & phí, ưu/nhược, điểm, ảnh)
- Tự tính: phí quản lý theo m², gửi xe, sạc, tổng cố định/tháng, ước tính có điện nước, chi phí vào ở, cả hợp đồng
- Upload nhiều ảnh (nén client ~1600px), chụp camera, lightbox, ảnh đại diện, kéo sắp xếp
- So sánh 2–4 căn (highlight tốt/tệ), xuất In/PDF và PNG
- Cài đặt trọng số & đơn giá mặc định (mặc định theo bảng The Rainbow – Vinhomes Grand Park, 08/2026)
- Seed 3 căn mẫu để xem thử ngay

## Yêu cầu

- Node.js 20+ (khuyến nghị 22)
- Tài khoản [Supabase](https://supabase.com)

## Dùng cá nhân

Không có đăng nhập. App mở thẳng danh sách và dùng **user đầu tiên** trong database.  
Link không public — ai có URL đều xem/sửa được. Khi cần auth lại, báo sau.

## 1. Tạo project Supabase

1. Tạo project mới.
2. **Storage**: chạy SQL trong [`supabase/storage-policies.sql`](supabase/storage-policies.sql).
3. Biến môi trường:
   - `DATABASE_URL` / `DIRECT_URL` (Database → Connect → Prisma)
   - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (Settings → API)

## 2. Chạy local

```bash
cp .env.example .env.local
# Điền NEXT_PUBLIC_SUPABASE_*, DATABASE_URL, DIRECT_URL

npm install
npx prisma migrate dev --name init
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) → dùng ngay. Nếu chưa có data, bấm **Tải 3 căn mẫu**.

### Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` (prototype) |
| `npm run db:studio` | Prisma Studio |
| `npm run test:costs` | Kiểm tra công thức chi phí |

## 3. Deploy Vercel

1. Push repo lên GitHub/GitLab.
2. Import project trên [Vercel](https://vercel.com).
3. Thêm Environment Variables (Production + Preview):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL
DIRECT_URL
```

4. Build Command mặc định (`next build`). Thêm trong `package.json` đã có `postinstall: prisma generate`.
5. Sau deploy lần đầu, chạy migrate một lần:

```bash
npx prisma migrate deploy
```

(hoặc dùng Vercel Postgres / Supabase SQL từ thư mục `prisma/migrations` sau khi tạo migration local).

6. Cập nhật Supabase Auth redirect URL với domain Vercel (`https://xxx.vercel.app/auth/callback`).

## Công thức chi phí (tóm tắt)

- **Phí QL** = đơn giá × diện tích (thông thủy hoặc tim tường)
- **Cố định/tháng** = giá thuê + QL (nếu chưa gồm) + gửi xe + sạc + internet + TV + phí khác
- **Ước tính/tháng** = cố định + điện + nước (chỉ khi có đủ đơn giá và sản lượng)
- **Vào ở** = cọc + tháng đầu + môi giới
- **Điểm tổng** = trung bình có trọng số các tiêu chí đã chấm (1–5)

## Cấu trúc chính

```
src/app/(app)/          # Danh sách, chi tiết, sửa, so sánh, cài đặt
src/app/(auth)/login/   # Magic link + Google
src/app/api/            # CRUD listings, photos, settings, seed
src/lib/costs.ts        # Tính chi phí (pure)
src/lib/scores.ts       # Điểm có trọng số (pure)
prisma/schema.prisma
```

## Ghi chú

- Dữ liệu mỗi user tách biệt theo `userId` (Supabase Auth UUID).
- Ảnh lưu private bucket; app dùng signed URL.
- Điện/nước “theo giá Nhà nước”: không tự bịa đơn giá bậc thang — để trống đơn giá thì dòng hiển thị “chưa ước tính”.

# So sánh căn hộ thuê

Web app mobile-first để ghi nhận căn hộ đang xem, tính chi phí, chấm điểm và so sánh.  
Stack: **Next.js 15 + TypeScript + Tailwind + Prisma + Vercel Postgres + Vercel Blob**.

## Dùng cá nhân

Không đăng nhập. Mở link là vào thẳng danh sách, dùng **user đầu tiên** trong DB.  
Ai có URL đều xem/sửa được.

## 1. Tạo storage trên Vercel

1. Vào [Vercel Dashboard](https://vercel.com) → project (hoặc tạo project từ repo).
2. **Storage → Create Database → Postgres** (Neon)
   - Connect to project → sẽ có biến `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, …
3. **Storage → Create Blob Store**
   - Connect to project → có `BLOB_READ_WRITE_TOKEN`

### Map biến cho Prisma

Trong `.env` / `.env.local` / Vercel Environment Variables:

```env
DATABASE_URL="..."           # = STORAGE_PRISMA_DATABASE_URL (hoặc POSTGRES_PRISMA_URL)
DIRECT_URL="..."             # = STORAGE_POSTGRES_URL (hoặc cùng DATABASE_URL)
BLOB_READ_WRITE_TOKEN="..."  # từ Blob store
```

App đọc tên `DATABASE_URL` / `DIRECT_URL` — nếu Vercel chỉ inject `STORAGE_*` thì thêm alias trong Project → Settings → Environment Variables.

## 2. Chạy local

```bash
cp .env.example .env.local
# Dán DATABASE_URL, DIRECT_URL, BLOB_READ_WRITE_TOKEN từ Vercel Storage

npm install
npx prisma migrate deploy
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Nếu chưa có data → **Tải 3 căn mẫu**.

### Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:studio` | Prisma Studio |
| `npm run test:costs` | Kiểm tra công thức chi phí |

## 3. Deploy Vercel

1. Push repo, import project.
2. Đảm bảo Postgres + Blob đã **Connect** vào project (env tự inject), hoặc thêm tay:
   - `DATABASE_URL` (= `POSTGRES_PRISMA_URL`)
   - `DIRECT_URL` (= `POSTGRES_URL_NON_POOLING`)
   - `BLOB_READ_WRITE_TOKEN`
3. Build: `prisma generate && next build` (đã có trong `package.json`).
4. Sau deploy lần đầu, nếu bảng chưa có:

```bash
npx prisma migrate deploy
```

(Hoặc chạy từ máy local với `DATABASE_URL` / `DIRECT_URL` production.)

## Công thức chi phí (tóm tắt)

- **Phí QL** = đơn giá × diện tích (thông thủy hoặc tim tường)
- **Cố định/tháng** = giá thuê + QL (nếu chưa gồm) + gửi xe + sạc + internet + TV + phí khác
- **Ước tính/tháng** = cố định + điện + nước (khi đủ đơn giá)
- **Vào ở** = cọc + tháng đầu + môi giới
- **Điểm tổng** = trung bình có trọng số các tiêu chí đã chấm (1–5)

## Cấu trúc chính

```
src/app/(app)/     # Danh sách, chi tiết, sửa, so sánh, cài đặt
src/app/api/       # CRUD listings, photos, settings, seed
src/lib/costs.ts   # Tính chi phí
src/lib/storage.ts # Vercel Blob
prisma/schema.prisma
```

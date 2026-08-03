# Base44 Production Deployment Readiness Checklist

Ini adalah senarai semak wajib sebelum sistem ini ditolak (*push*) ke persekitaran Pengeluaran (*Production*) pada Base44 Cloud Infrastructure. Sila pastikan semua kotak ditandai sebelum pelancaran besar-besaran (Go-Live).

## 1. Pembolehubah Persekitaran (Environment Secrets)
Pastikan kekunci rahsia berikut telah dikonfigurasi di dalam tetapan Repository Secrets (GitHub Actions) dan persekitaran `.env.production` Base44:

- [ ] `BASE44_SERVICE_ROLE_KEY`: Token induk bagi memberikan fungsi pelayan akses memintas RLS (Row Level Security) ke atas Entiti Pangkalan Data.
- [ ] `OPENAI_API_KEY`: Kunci API OpenAI / Anthropic bagi menggerakkan ejen penjana kuiz ($N \times 5$ Rule) di dalam laluan `invokeLLM`.
- [ ] `NODE_ENV`: Disetkan kepada `production`.

## 2. Penghijrahan Entiti Pangkalan Data (Database Migration)
Pastikan entiti berikut telah didaftarkan dan beroperasi di Base44 secara stabil (Idempotent):

- [ ] **`Questions`**: Menampung metadata soalan (`tp_level`, `subtopic_id`, dll).
- [ ] **`QuizAttempts`**: Menyimpan sejarah jawapan pelajar yang bersambung dengan `evaluateDiagnosticQuiz`.
- [ ] **`StudentMastery` / `StudentTopicGate`**: Tiang utama yang mencetuskan gerbang lulus/gagal dan bertukar hijau/merah pada Papan Pemuka Ibubapa.

## 3. Validasi Arkitektur Fungsi (Serverless Audit)
- [ ] `generateTopicMasteryQuiz/entry.ts` bebas dari kod ujian/mock.
- [ ] `evaluateDiagnosticQuiz/entry.ts` memiliki lapisan pencegah berbilang permintaan (Idempotency Hash check) aktif.
- [ ] Masa tamat (*timeout*) bagi pelayan fungsi AI diset $\ge$ 60 saat di dalam *Base44 Dashboard* untuk menampung janaan LLM yang sarat.

## 4. GitHub Actions (CI/CD)
- [ ] Pipa CI/CD `.github/workflows/deploy-base44.yml` aktif dan sedang mencerap (*watching*) cawangan `main`.
- [ ] *Smoke Test* diintegrasikan ke dalam langkah pengujian pelancaran akhir automatik.

---
**Tanda Tangan Pengesahan:** 
_Jurutera Integrasi Awan (Cloud Integration Engineer)_

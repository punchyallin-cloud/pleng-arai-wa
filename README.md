เพลงไรวะ V10 — Mobile Local Catalog

เวอร์ชันนี้แก้ปัญหามือถือแบบเปลี่ยนโครงสร้าง:
- มือถือไม่เรียก iTunes Search API ตอนเริ่มเกมอีกแล้ว
- GitHub Actions สร้าง catalog.json บนเซิร์ฟเวอร์ล่วงหน้า
- หน้าเกมโหลด catalog.json จาก plengraiwa.com โดยตรง (same-origin)
- autocomplete และรูปศิลปินใช้ catalog ในเว็บ ไม่ยิง API จากมือถือ
- ตอนเล่นมีเพียงการโหลดไฟล์ preview ของเพลงที่สุ่มได้
- 6 เพลง / Easy → Impossible / 1-3-5-10 วิ / T-POP / แร็ปไทย / Kamikaze / Leaderboard

หลังอัปไฟล์:
1) เปิดแท็บ Actions ใน repo
2) รอ “Build song catalog” เป็นสีเขียว (รอบแรกประมาณหลาย分钟 เพราะจำกัด request)
3) รอ Pages deploy อีกรอบ แล้วเปิด plengraiwa.com ใหม่

ถ้า Action ไม่เริ่ม: Actions → Build song catalog → Run workflow.

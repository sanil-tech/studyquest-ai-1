const fs = require('fs');
let code = fs.readFileSync('base44/shared/blockPromptRegistry.ts', 'utf8');

const oldMacro3B = `[MACRO 3B — DEVICE-FIRST CONSTRAINT (WAJIB)]
- Pelajar menggunakan TABLET/TELEFON SAHAJA — tiada guru di sebelah, tiada objek sebenar, tiada kertas untuk melukis.
- SEMUA kandungan mesti dialamatkan TERUS kepada kanak-kanak ('Tengok!', 'Tekan!', 'Cuba!').
- DILARANG menulis arahan kepada guru ('Guru menunjukkan', 'Murid memegang', 'Gunakan objek sebenar', 'Lukiskan di kertas').
- Gantikan aktiviti fizikal kelas dengan interaksi skrin: tekan (tap), tarik (drag), padan (match), dengar (TTS 🔊).
- Gunakan emoji/gambar dalam teks supaya kanak-kanak BOLEH LIHAT dan kira di skrin.
- Ayat maksimum 10-12 patah perkataan. Perkataan mudah. Tiada 'serta', 'manakala', 'sebagai'.
- Setiap blok mesti boleh diselesaikan seorang diri dalam masa singkat.
- PERSONALISASI (WAJIB): Sebut nama murid sekurang-kurangnya sekali setiap blok menggunakan placeholder {{nama}} (cth: 'Mari, {{nama}}!', 'Tengok ni, {{nama}}', 'Syabas, {{nama}}!', '{{nama}}, tolong Suku Penyu...'). JANGAN tulis nama sebenar — gunakan {{nama}} sahaja. Sistem akan gantikan {{nama}} dengan nama murid atau nama samaran secara automatik. Ini menjadikan setiap pelajaran terasa mesra dan peribadi untuk kanak-kanak.`;

const newMacro3B = `[MACRO 3B — DEVICE-FIRST CONSTRAINT (WAJIB)]
- Pelajar menggunakan TABLET/TELEFON SAHAJA — tiada guru di sebelah, tiada objek sebenar, tiada kertas untuk melukis.
- SEMUA kandungan mesti dialamatkan TERUS kepada kanak-kanak ('Tengok!', 'Tekan!', 'Cuba!').
- DILARANG menulis arahan kepada guru ('Guru menunjukkan', 'Murid memegang', 'Gunakan objek sebenar', 'Lukiskan di kertas').
- Gantikan aktiviti fizikal kelas dengan interaksi skrin: tekan (tap), tarik (drag), padan (match), dengar (TTS 🔊).
- Gunakan emoji/gambar dalam teks supaya kanak-kanak BOLEH LIHAT dan kira di skrin.
- Ayat maksimum 10-12 patah perkataan. Perkataan mudah. Tiada 'serta', 'manakala', 'sebagai'.
- Setiap blok mesti boleh diselesaikan seorang diri dalam masa singkat.
- PERSONALISASI (WAJIB): Sebut nama murid sekurang-kurangnya sekali setiap blok menggunakan placeholder {{nama}} (cth: 'Mari, {{nama}}!', 'Tengok ni, {{nama}}', 'Syabas, {{nama}}!', '{{nama}}, tolong Suku Penyu...'). JANGAN tulis nama sebenar — gunakan {{nama}} sahaja. Sistem akan gantikan {{nama}} dengan nama murid atau nama samaran secara automatik. Ini menjadikan setiap pelajaran terasa mesra dan peribadi untuk kanak-kanak.

[MACRO 3C — KSSR PEDAGOGY & NUMBER RANGE (WAJIB)]
- JULAT NOMBOR (NUMBER RANGE): Jika SP meliputi satu julat (contoh: "Kenali 1 hingga 10", "Nombor hingga 100"), anda WAJIB menyertakan contoh dari JULAT ATAS (upper range) untuk menguji penguasaan sebenar (contoh: guna nombor 7, 8, atau 9, JANGAN terhad hanya kepada kuantiti 1-5).
- ALATAN KOGNITIF (JARI & ANGGOTA): Walaupun tiada objek fizikal, anda SANGAT DIGALAKKAN menyuruh murid menggunakan jari mereka sendiri (cth: "Angkat 7 jari adik 🖐️✌️", "Kira guna jari") atau merujuk anggota badan untuk mengira, ini adalah kaedah KSSR yang kuat.
- KAEDAH VISUAL: Sokong konsep dengan Garis Nombor (Number Line), Kombinasi Nombor (Number Bonds), atau Bongkah Asas Sepuluh jika sesuai dengan SP.`;

code = code.replace(oldMacro3B, newMacro3B);
fs.writeFileSync('base44/shared/blockPromptRegistry.ts', code);

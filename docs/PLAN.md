# BE Free-Form Project — Idea & Plan

> สถานะ: **ร่างแผน (ยังไม่เริ่ม implement)** · บันทึกเมื่อ 2026-11-11
> งาน: EC416 BE Free-Form (10% ของคะแนน) · ส่ง **16 ธ.ค. 2569 (2026-12-16)** ผ่าน Google Classroom
> ไฟล์ที่ส่งต้องชื่อ `befreeform_ชื่อกลุ่ม.fileformat` (ดู [ข้อสังเกตการส่งงาน](#7-การส่งงาน))
> ต้นทาง: `EC416_BEFreeform_guideline.pdf` (ไกด์ไลน์: ไม่จำกัดรูปแบบ, เดี่ยวหรือกลุ่ม ≤ 8 คน, จำนวนคนถ่วงน้ำหนักคะแนน)

---

## 1. โจทย์และข้อจำกัดที่ผู้ใช้กำหนด

- **ไม่อยากอัดคลิป** ("ไม่ว้าว") — อยากได้สาย data analytics / ML / AI / coding / website / dashboard
- ต้องมี **output ที่จับต้องได้** · คิดว่าทำเกมเต็มรูปแบบ "ใหญ่ไป"
- Host บน **GitHub / Vercel** (ผู้ใช้มีคำตอบในใจแล้ว)
- ใช้ **Claude Code** สร้าง · ผู้ใช้ประเมินว่า build ได้ใน 2–3 วัน
- **ไม่ต้องมีคนทดลอง / ไม่ต้องใหญ่ / ไม่ต้อง stat หนัก**
- อยากได้ **interactive**: ให้คน interact แล้ว **reveal ผลที่เกี่ยวกับ BE ตอนจบ** (เหมาะกับเว็บ/dashboard)
- Target = **นักศึกษามหาวิทยาลัย** → ต้อง relate กับชีวิตจริง · เนื้อหา BE **ไม่จำเป็นต้องอยู่ในสไลด์**
- Concept = **"ครั้งหนึ่งในชีวิตมหาวิทยาลัย"** (ไม่ใช่ 1 วัน) · ใช้ **ครบ 5 stations**

## 2. เส้นทางที่เคยพิจารณา (เก็บไว้เป็นบันทึกการตัดสินใจ)

| ไอเดีย | ผล | เหตุผล |
|---|---|---|
| Bias Lab (ประมาณ β, δ, λ จากคนจริง + backend) | ตัดออก | ต้องหาคนทดลอง + backend + stat หนัก ใหญ่เกิน |
| Nudge A/B test จริง | ตัดออก | ต้องมี N พอ ต้องหาคน |
| LLM เป็นผู้ทดลอง (ให้ LLM ทำ experiment BE) | พับไว้ | ผู้ใช้ไม่ต้องการ stat หนัก, ผล sensitive ต่อ prompt |
| Bunching ข้อมูลไทย (replicate Allen et al.) | ตัดออก | หาข้อมูลได้ไหมไม่แน่นอน |
| Life Simulator / paper → prototype (SEED ฯลฯ) | ตัดออก | ผู้ใช้อยากได้ "ว้าว" และ interact มากกว่า simulation ที่ calibrate |
| Disposition effect บนราคาหุ้นไทย, Beauty contest, Herding, Schelling | ไม่เลือก | ไม่ตรงกับ target นักศึกษา / ไม่ใช่ interact แล้ว reveal |
| **Station-based "ประสบการณ์แล้ว reveal" สำหรับนักศึกษา** | ✅ **เลือก** | interactive, เว็บล้วน, relate กับชีวิต, ไม่ต้องมีคน/backend |

## 3. Concept ที่เลือก

**ชื่อชั่วคราว: "4 ปีมหาลัย: สมองคุณทำอะไรไว้บ้าง"**
เกมเว็บสั้น ๆ (~7–8 นาที) พาผู้เล่นผ่านเหตุการณ์สำคัญ 5 ช่วงของชีวิตมหาวิทยาลัย แต่ละช่วงวัดพฤติกรรมจริงของผู้เล่นแบบแอบ ๆ แล้วจบด้วย **Behavioral Transcript** (หน้าตาแบบใบ transcript) ที่ reveal ว่าสมองคุณมี bias อะไร พร้อมกลไก งานวิจัย และวิธีรับมือ

### เส้นเวลา 4 ปี ↔ 5 stations

| ช่วงเวลา | เหตุการณ์ | Station | BE concept |
|---|---|---|---|
| ปี 1 เทอม 1 | คืนแรกในหอ ไม่มีใครคุมเวลา | **1. ไถอีกแป๊บเดียว** | self-control, naivete, habit |
| ปี 1 เทอม 2 | ได้ค่าขนมก้อนแรก เจอ "ผ่อน 0%" | **3. Pay-later** | present bias, mental accounting |
| ปี 2 | เรียนมา 3 เทอมแล้ว จะเปลี่ยนเอกไหม | **4. จ่ายไปแล้วเสียดาย** | sunk cost |
| ปี 3 | งานกลุ่มที่คะแนนเท่ากันทุกคน | **5. กรุ๊ปโปรเจกต์** | free-riding, conditional cooperation |
| ปี 4 | Senior project / ธีสิส | **2. วางแผน vs ตัวเองตอนดึก** | procrastination, planning fallacy |

> หมายเหตุเลข: ลำดับในตารางคือลำดับเล่นในเกม; เลข station ด้านซ้ายคือเลขเดิมตอนเสนอไอเดีย

### กฎการออกแบบสำคัญ
1. **ห้ามเฉลยชื่อ bias ระหว่างเล่น** — แต่ละ station จบด้วย "บันทึกความทรงจำ" แบบกลาง ๆ (เช่น "คืนนั้นคุณไถไป 11 นาที") ชื่อ bias + คำอธิบายเก็บไว้ตอนจบ ไม่งั้น station ถัดไปจะถูก prime
2. **Mechanism-first** — reveal อธิบาย "ทำไมสมองทำแบบนี้" ก่อนชื่อ bias
3. **Reveal เทียบกับตัวแทนที่ rational (= 0)** ไม่ใช่เทียบค่ากลางประชากร เพราะไม่มีข้อมูลคนไทย เกณฑ์ ต่ำ/กลาง/สูงเป็นเกณฑ์ที่เราตั้งเอง ต้องบอกในเว็บ
4. ผลจากการเล่น 5 นาทีเป็น **ภาพประกอบเพื่อการเรียนรู้ ไม่ใช่การวินิจฉัย** — ต้องมี disclaimer
5. **ไม่เก็บข้อมูลผู้เล่น** — คำนวณใน browser ทั้งหมด

## 4. Mechanic และสิ่งที่วัดในแต่ละ station

### Station "ไถอีกแป๊บเดียว" (ปี 1 เทอม 1)
- **Interact:** ทายก่อนว่าจะไถกี่นาที (จำกัดสูงสุด ~2.5 นาที) → เข้า feed จำลองแบบ infinite scroll จับเวลาจริง → รอบสองเลือกได้ว่าจะตั้ง limit ให้ตัวเองไหม
- **วัด:** ทาย vs จริง (naivete) · เลือก commit หรือไม่ (sophistication)
- **Reveal:** present bias/self-control gap, ผลของ commitment
- **หลักฐาน:** Allcott–Gentzkow–Song (Digital Addiction): self-control problems + habit formation อธิบายการใช้โซเชียลเฉลี่ย **31% (~48 นาที/วัน)**; การตั้ง limit ลดเวลาลงราว **17%** — แต่ sample เป็น **ผู้ใหญ่ 18–64 ในสหรัฐ** ไม่ใช่นักศึกษา
- **ระวัง:** การไถใน demo feed ≠ การใช้โซเชียลจริง; feed ต้องออกแบบเองไม่ลอก TikTok

### Station "Pay-later" (ปี 1 เทอม 2)
- **Interact:** 3 เดือน เงินเดือนละ ~8,000 ฿ ซื้อของราคาใกล้เคียงกัน สลับระหว่างแสดง "ราคาเต็ม" กับ "แสดงเป็นงวด" (สุ่มลำดับ/counterbalance) ปิดด้วยหน้าสรุปยอดผูกพัน
- **วัด:** อัตราซื้อต่างกันระหว่างสองแบบ (within-subject) · ยอดผูกพันที่คิดว่ามี vs ยอดจริง
- **Reveal:** present bias, mental accounting, pain of paying
- **หลักฐาน:** งานทดลองของ Central Bank of Ireland/TCD (IMEBESS 2025): การรับรู้ยอดคงเหลือที่ "ดูเพิ่ม" จากการใช้ BNPL ก่อนหน้าผลักดันการใช้จ่ายเพิ่ม; risk disclosure ช่วยความเข้าใจแต่ไม่ลดการใช้จ่าย · thesis UPLB (215 นักศึกษา): present bias เพิ่มโอกาสใช้ BNPL แต่ mental accounting ไม่มีนัยสำคัญ (sample เล็ก ไม่สุ่ม)
- **ระวัง:** ใช้แบรนด์สมมติ (เช่น "ShopLater") ไม่เลียนแบบ Shopee/SPayLater ตรง ๆ

### Station "จ่ายไปแล้วเสียดาย" (ปี 2)
- **Interact:** 4 คู่ scenario ที่ผลลัพธ์อนาคตเหมือนกัน ต่างแค่มี/ไม่มีต้นทุนที่จมไปแล้ว (ตั๋วคอนเสิร์ตแต่ป่วย, วิชาที่เรียนมา 3 เทอมแต่เกลียด, ค่ายิมรายปี, โปรเจกต์ที่ทำ 40 ชม. แต่ไอเดียแย่) วางห่างกันในเกม ตอบแบบปัดซ้าย-ขวา
- **วัด:** กี่คู่ที่ตอบไม่สม่ำเสมอ (within-subject → สรุปรายคนได้จริง)
- **Reveal:** sunk cost + เชื่อมกับ loss aversion (บท 9)
- **หลักฐาน:** IZA DP 17639 (Milovanska-Farrington & Mateer, forthcoming): นักศึกษาที่เรียน econ มาก่อน susceptibility ต่ำกว่า และลดลงหลังเรียนรู้เรื่องนี้ — **อ่านได้แค่ abstract ยังไม่ยืนยันวิธีวัด**

### Station "กรุ๊ปโปรเจกต์" (ปี 3)
- **Interact:** strategy method: "ถ้าเพื่อนลงแรงเฉลี่ย 0 / 3 / 6 / 9 จาก 10 คุณจะลงเท่าไร" (slider)
- **วัด:** ความชันของคำตอบ → free-rider / conditional cooperator / unconditional contributor
- **Reveal:** social preference, reciprocity (บท 11–12)
- **หลักฐาน:** งานคลาสสิกของ Fischbacher–Gächter–Fehr — **ผมจำได้จากความจำ ยังไม่ได้ค้น/ยืนยันตัวเลข ต้องเปิดต้นฉบับก่อนอ้าง**

### Station "วางแผน vs ตัวเองตอนดึก" (ปี 4)
- **Interact:** ตั้ง deadline ย่อยของงาน 3 ชิ้น (ชิดหรือห่าง) + วางแผนชั่วโมงต่อวัน → จำลอง 14 วันที่มีสิ่งยั่วยวนสุ่ม (เพื่อนชวน, ซีรีส์) ให้เลือกทำงานหรือเล่น
- **วัด:** แผน vs ที่ทำจริง (planning fallacy/present bias) · ความต้องการ commitment (ตั้ง deadline ชิด)
- **Reveal:** procrastination, planner–doer (บท 6)
- **หลักฐาน:**
  - Ariely & Wertenbroch (2002): นักศึกษาตั้ง deadline ให้ตัวเอง แต่ได้ผลน้อยกว่า deadline ที่คนอื่นกำหนด
  - Bisin & Hyndman (NBER w19874): นักศึกษา demand deadline สูง แต่ deadline **ไม่ได้** ทำให้งานเสร็จมากขึ้น; present bias ราว 30–40% ของ sample → **ขัดกับงานแรกบางส่วน ผลยังไม่ลงตัว reveal ห้ามสรุปเกินจริง**
  - Planning fallacy: ตัวเลข "14%–102% overconfident" มาจาก **textbook สรุปรอง** (ผลวิจัย 1994 เรื่องเวลาทำธีสิส) ยังไม่ยืนยันกับต้นฉบับ

## 5. Tools และ Architecture

- **Stack:** Vite + React + TypeScript · Tailwind · Framer Motion · Zustand · Recharts (radar) · html-to-image (share card) · Vitest (test สูตรคะแนน) · Playwright (smoke test)
- **ไม่มี backend** — state อยู่ใน memory + localStorage
- **Hosting:** Vercel (เชื่อม GitHub repo, preview deploy ทุก push) หรือ GitHub Pages (ต้องตั้ง base path/hash router)
- **โครงโฟลเดอร์:**
  ```
  src/
    stations/<name>/   # Play.tsx, metrics.ts, content.ts, metrics.test.ts
    core/              # store, scoring, benchmarks
    reveal/            # Transcript, RadarChart, ShareCard
  ```
  แต่ละ station เป็นโมดูลอิสระ (`RawResult → metrics → trait score → store → reveal`) → ตัด station ได้โดยไม่พังส่วนอื่น
- ข้อความ/ที่มาเก็บเป็นข้อมูลแยกไฟล์ (`content.ts`) → แก้ copy ง่าย + generate หน้า "ที่มา" อัตโนมัติ
- **แบรนด์/ภาพ:** ใช้ชื่อและ UI ที่ออกแบบเอง (ไม่ลอก Shopee/TikTok); ภาพประกอบทำเป็น SVG เอง หรือใช้ชุดฟรีที่เช็ก license แล้ว

## 6. UX/UI

**Flow:**
Landing (hook + "ไม่เก็บข้อมูล") → แผนที่เส้นเวลา 4 ปี → [intro ฉาก → เล่น → บันทึกความทรงจำ] × 5 → ฉากรับปริญญา → Reveal ทีละ bias → Behavioral Transcript + ปุ่มแชร์ + หน้า "ที่มา/ข้อจำกัด" → เล่นอีกรอบ

- **Mobile-first (390px)** (นักศึกษาเล่นบนมือถือ) + desktop แบบคอลัมน์กลาง
- **Visual:** ภาพประกอบแบนโทนอบอุ่น แต่ละปีมีสีประจำ + progress rail บอกว่าอยู่ปีไหน
- **Interaction ตามธรรมชาติ station:** infinite scroll / ติ๊กซื้อ-ผ่อน / swipe card / slider
- **Reveal:** radar 5 แกน + การ์ดต่อ bias 4 ส่วน: *คุณตอบอะไร → กลไก → งานวิจัย+ข้อจำกัด → ในชีวิต นศ. เจอที่ไหน/แก้ยังไง*
- **Transcript:** หน้าตาแบบใบ transcript ที่คนไทยคุ้นตา เป็นตัวชูความว้าว/แชร์
- **A11y/typography:** Prompt หรือ Noto Sans Thai, line-height ~1.6, contrast ผ่าน WCAG, เคารพ `prefers-reduced-motion`

## 7. การส่งงาน

- ไกด์ไลน์กำหนดชื่อไฟล์ `befreeform_ชื่อกลุ่ม.fileformat` ส่งใน Google Classroom (ตัวแทนกลุ่ม 1 คน) → **ไกด์ไลน์ไม่ได้บอกว่าส่งลิงก์ล้วนได้**
- แนะนำส่งเป็น **PDF** ที่มี: ลิงก์เว็บ + QR + screenshot + อธิบาย BE concept ที่ใช้ + ที่มา/ข้อจำกัด (อาจแนบ source zip ด้วย)
- ต้องให้เว็บ live อยู่จนถึงหลังตรวจคะแนน
- (ถ้าสงสัย ถามอาจารย์/TA ว่ารับ web app เป็นผลงานได้ไหมและรูปแบบไฟล์ที่ต้องการ)

## 8. Timeline (5–7 วัน; deadline 16 ธ.ค.)

| วัน | งาน |
|---|---|
| 0 | spec, design tokens, ร่าง copy ภาษาไทย |
| 1 | scaffold, shell, state, เส้นเวลา, ตั้ง deploy |
| 2 | Pay-later + Sunk cost (ง่าย) |
| 3 | ไถอีกแป๊บเดียว + กรุ๊ปโปรเจกต์ |
| 4 | วางแผน vs ตอนดึก (ซับซ้อนสุด) |
| 5 | Reveal, Transcript, radar, share card |
| 6 | ให้เพื่อน 3–5 คนลองเล่น (เพื่อดู UX ไม่ใช่วิจัย) → แก้ → เขียนหน้าที่มา |
| 7 | buffer, README, ทำ PDF ส่งงาน |

**ถ้าเวลาบีบ:** ตัด "กรุ๊ปโปรเจกต์" หรือ "วางแผน vs ตอนดึก" ก่อน — reveal ยังสมบูรณ์ได้ด้วย 3–4 แกน
**Timeline ที่ผู้ใช้ประเมินไว้** คือ 2–3 วัน; ประมาณการนี้ (5–7 วัน) รวม UX polish + 5 stations + playtest

## 9. ความเสี่ยงและสิ่งที่ยังไม่ verify

- [ ] เปิด **paper ต้นฉบับ** ยืนยันตัวเลขทุกตัวก่อนใส่ในหน้า "ที่มา" (ส่วนใหญ่ตอนนี้มาจากผลค้นหา/abstract/สรุปรอง)
- [ ] ตัวเลข Fischbacher–Gächter–Fehr ยังไม่ได้ค้นเลย
- [ ] งานวิจัยส่วนใหญ่ **ไม่ได้ทำกับ นศ. ไทย** — ต้องบอก sample ของแต่ละ benchmark
- [ ] ผล deadline/procrastination ยังขัดแย้งกันในวรรณกรรม — reveal ต้องสะท้อนความไม่แน่นอน
- [ ] เกณฑ์ ต่ำ/กลาง/สูง เป็นของเราเอง ไม่ใช่ norm
- [ ] ความยาวเกม: คุม station ละ ≤ ~90 วินาที (รวม ~7–8 นาที)
- [ ] ข้อความภาษาไทยให้ผู้ใช้รีวิวน้ำเสียง
- [ ] counterbalance/randomize ลำดับใน Pay-later และ Sunk cost ให้ถูกต้อง

## 10. คำถามที่ยังเปิดอยู่

1. ~~ทำคนเดียวหรือเป็นกลุ่ม?~~ → **ทำคนเดียว** (ตอบ 2026-11-11)
2. ~~ถามอาจารย์เรื่องรูปแบบส่ง?~~ → **ไม่ต้อง** อาจารย์รับรูปแบบอะไรก็ได้; ผู้ใช้จัดการส่งงาน/playtest/รีวิวเอง
3. ~~Hosting / repo / push~~ → **ทำบน local ก่อน ไม่ push** (รัน dev server บนเครื่อง); ตัดสินใจ host + ขออนุญาต push ทีหลังตอน Phase 4
5. ชื่อที่ใช้ในไฟล์ส่ง `befreeform_<ชื่อ>.pdf` — **รอคำตอบ**
6. Default ถ้าไม่แย้ง: ไทยล้วน, ภาพประกอบแบนโทนอบอุ่น (SVG เขียนเอง)

## 13. Execution plan (Orchestration, เป้า 1–2 วัน)

ผู้ใช้กำหนด: ทำคนเดียว, ใช้ Opus เป็น orchestrator, เป้า **1–2 วัน**
บทบาท: **Orchestrator (session หลัก)** = วาง core, แจกงาน, รวมงาน, ตรวจ, deploy · **Subagents** = ทำ station คู่ขนานใน worktree แยก

### Phase 0 — Foundation (orchestrator ทำเอง, ต้องเสร็จก่อนแตกงาน)
- [ ] `CLAUDE.md` ของโปรเจกต์ (กฎ: ห้ามเฉลย bias ระหว่างเล่น, ไม่ใช้แบรนด์จริง, rational benchmark, ไทยล้วน, stack)
- [ ] `git init` + scaffold Vite + React + TS + Tailwind + Framer Motion + Zustand + Recharts + Vitest
- [ ] **Contract กลาง:** `Station` interface (`Intro`, `Play`, `computeMetrics`, `memoryLine`), `TraitScore` type, store, scene state machine (landing → timeline → station×5 → graduation → reveal)
- [ ] Design tokens (สีประจำปี, font, spacing), layout shell, progress rail, landing, หน้าเส้นเวลา
- [ ] Station stub 5 ตัวที่ผ่าน flow ได้ครบ (เล่นจบได้แม้ยังว่าง)
- [ ] `.claude/launch.json` สำหรับรัน dev server บนเครื่อง (ยังไม่ตั้ง deploy/ไม่ push จนกว่าผู้ใช้อนุญาต)
- **Checkpoint A:** ผู้ใช้ดู look & feel ของ landing + timeline

### Phase 1 — Stations (subagents คู่ขนาน, worktree แยก, แตะเฉพาะ `src/stations/<name>/`)
| Agent | งาน | ความยาก |
|---|---|---|
| A | Pay-later (3 เดือน, ราคาเต็ม vs งวด, counterbalance) | กลาง |
| B | Sunk cost (4 คู่, swipe card, กระจายลำดับ) | ต่ำ |
| C | ไถอีกแป๊บเดียว (feed จำลอง, จับเวลา, รอบ limit) | กลาง |
| D | กรุ๊ปโปรเจกต์ (strategy method slider, จัด type) | ต่ำ |
| E | วางแผน vs ตอนดึก (deadline + จำลอง 14 วัน) — **ถ้าเวลาบีบ ลดเหลือ 7 วัน** | สูง |
| F | Research: ยืนยันตัวเลขทุกตัวกับต้นฉบับ → `src/core/sources.ts` (ตัวไหนยืนยันไม่ได้ให้ตัด/ติดป้าย) | กลาง |

แต่ละ station ต้องมี: `Play.tsx`, `metrics.ts` + `metrics.test.ts` (ผ่าน), `content.ts` (copy ไทย), memory line แบบไม่เฉลย bias

### Phase 2 — Integration + Reveal (orchestrator)
- [ ] Merge ทีละ station, รัน test + build ทุกครั้ง
- [ ] ฉากรับปริญญา → Reveal ทีละ bias (กลไก → งานวิจัย/ข้อจำกัด → ชีวิต นศ./วิธีแก้)
- [ ] Behavioral Transcript + radar 5 แกน + share card (PNG) + หน้า "ที่มา/ข้อจำกัด"
- **Checkpoint B:** ผู้ใช้เล่นครบ 1 รอบ + รีวิวข้อความไทย

### Phase 3 — QA (orchestrator + built-in browser)
- [ ] เล่นจบครบทุกเส้นทางบน mobile (390px) + desktop
- [ ] `prefers-reduced-motion`, contrast, ไม่มี console error, build ผ่าน, ความยาวรวม ~7–8 นาที
- [ ] ตรวจงานของ subagent เอง (test + ดูหน้าจอจริง) ไม่เชื่อรายงานอย่างเดียว

### Phase 4 — Ship
- [ ] เลือก host + ขออนุญาตสร้าง repo/push → deploy production + เช็กลิงก์จริง
- [ ] README (concept, BE ที่ใช้, วิธีรัน, ที่มา)
- [ ] PDF ส่งงาน `befreeform_<ชื่อ>.pdf`: ลิงก์ + QR + screenshot + อธิบาย BE + ที่มา/ข้อจำกัด

### Timeline 1–2 วัน
- **วันที่ 1:** Phase 0 → Phase 1 (คู่ขนาน) → เริ่ม Phase 2
- **วันที่ 2:** จบ Phase 2 → Phase 3 → Phase 4
- ความเสี่ยงหลัก: Station E ซับซ้อนสุด; ข้อความไทยต้องให้ผู้ใช้รีวิว; subagent อาจตีความ contract ต่างกัน → contract ต้องชัดใน Phase 0

## 11. Sources (ที่ใช้ตอนค้น)

- Bisin & Hyndman, *Present-Bias, Procrastination and Deadlines in a Field Experiment* — https://www.nber.org/papers/w19874
- Ariely & Wertenbroch, *Procrastination, Deadlines, and Performance* — https://erationality.media.mit.edu/papers/dan/eRational/Dynamic%20preferences/deadlines.pdf
- Allcott, Gentzkow & Song, *Digital Addiction* (NBER w28936) — https://www.nber.org/system/files/working_papers/w28936/w28936.pdf
- UPLB thesis: BNPL usage and financial well-being among students — https://www.ukdr.uplb.edu.ph/etd-undergrad/13136
- IMEBESS 2025 abstract: BNPL online shopping experiment — https://coms.events/imebess25/data/abstracts/en/abstract_0088_0145_0059.html
- Amherst thesis, "Venmo Effect" — https://amherst.edu/system/files/media/Emily%20Kiernan%20Thesis%20April%202021.pdf
- IZA DP 17639, sunk cost fallacy and students — https://iza.org/publications/dp/17639
- Krugman & Wells, *Behavioral Economics* (textbook summary, planning fallacy/deadlines) — https://digfir-published.macmillanusa.com/krugmanwellsmicro4/krugmanwellsmicro4_ch9_5.html

## 12. เชื่อมกับเนื้อหาในคลาส (`../notes/`)

- Present bias / planner–doer / quasi-hyperbolic → `6_Time_Preference_Part1.md`
- Credit card borrowing, commitment device (SEED) → `7_Time_Preference_Part2.md`
- Prospect theory, loss aversion → `9_Risk_Preference_Prospect_Theory.md`, `10_Loss_Aversion_in_the_Field.md`
- Social preference, reciprocity, social norm → `11_Social_Preference.md`, `12_Social_Preference_Applications.md`
- Nudge/default/dark nudge (ใช้ตอน reveal "แก้ยังไง") → `2_`–`5_`
- Field experiment design (between-subject, randomization) → `13_Case_Study_Racial_Bias_in_Hiring.md`

## 14. สถานะล่าสุด / Handoff (2026-11-11)

- ✅ **Phase 0 เสร็จ** (commit `e390d03`, local only): scaffold, contract (`src/core/types.ts`), store, RNG, sources (ยัง `verified: false` ทุกตัว), ฉาก landing → intro → play → memory → graduation → reveal (ร่าง), station stub 5 ตัวเล่นผ่านได้ครบ, build/test/lint ผ่าน, ตรวจใน browser แล้ว
- โปรเจกต์ย้ายออกจาก `EC416/BE_Freeform_Project` มาที่นี่ เพื่อไม่ให้ CLAUDE.md ติวเตอร์ของ EC416 มีผล
- Dev shortcut: `?dev=<stationId>` / `?dev=graduation` / `?dev=reveal`
- ✅ **Checkpoint A ผ่าน** + brand/CI v1 (ดู `docs/DESIGN.md`): Jester + Sage, CI สมุดจดไฮไลต์, mascot "ต่อม", share card ใบเกรดล้อเลียน
- ⏭️ **ถัดไป: Phase 1** ตามหัวข้อ 13: แตก subagent 5 ตัว (หนึ่งตัวต่อ station ใน worktree แยก แตะเฉพาะ `src/stations/<id>/`) + 1 ตัวตรวจตัวเลขงานวิจัย → orchestrator merge + ตรวจเอง
- ยังค้าง: ชื่อในไฟล์ส่งงาน (`befreeform_<ชื่อ>.pdf`), เลือก host + ขออนุญาต push (Phase 4)

-- Run this in Supabase -> SQL Editor (production database).
-- LINGAUX : Academy lesson system (Lesson + LessonProgress tables + full content).
-- Safe to re-run? YES - idempotent (upserts by slug / courseId+order).

CREATE TABLE IF NOT EXISTS "Lesson" (
    "id"        TEXT    NOT NULL,
    "courseId"  TEXT    NOT NULL,
    "order"     INTEGER NOT NULL,
    "title"     TEXT    NOT NULL,
    "body"      TEXT    NOT NULL,
    "drill"     TEXT    NOT NULL DEFAULT '',
    "minutes"   INTEGER NOT NULL DEFAULT 10,
    "free"      BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LessonProgress" (
    "id"       TEXT    NOT NULL,
    "userId"   TEXT    NOT NULL,
    "lessonId" TEXT    NOT NULL,
    "doneAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Lesson_courseId_order_key" ON "Lesson"("courseId", "order");
CREATE INDEX IF NOT EXISTS "Lesson_courseId_idx" ON "Lesson"("courseId");
CREATE UNIQUE INDEX IF NOT EXISTS "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");
CREATE INDEX IF NOT EXISTS "LessonProgress_userId_idx" ON "LessonProgress"("userId");

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'The 30-Day Game Plan', '30-day-game-plan', 'general', 8, '8 lessons • LINGAUX method', true, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60', NULL, 'The science-backed loop: record 5-min, wait 24h, triple-scan, fix 1/week. Your foundation.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 1, 'How the loop works', 'Most people practice speaking the way they practice everything else: they repeat what feels comfortable and avoid what feels awkward. That is why years of meetings and presentations often produce zero improvement — the discomfort is avoided, so the data never arrives.

The LINGAUX loop fixes this with four steps. First, you record a 5-minute impromptu talk with no script. Second, you wait 24 hours before reviewing it. Third, you triple-scan the recording: audio for fillers and pace, video muted for body language, transcript for structure. Fourth, you pick exactly one weakness and drill it for a week.

Each step has a reason backed by learning science. Impromptu recording forces retrieval under pressure, which is when real habits show. The 24-hour wait creates psychological distance so you judge the speaker, not yourself. Triple-scanning separates channels your brain normally blends together. And single-focus practice beats scattered effort because attention is finite.', 'Write the four steps on paper from memory: Record, Wait, Scan, Fix. Under each, write one sentence explaining WHY it exists. 5 minutes.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 2, 'Your first 5-minute recording', 'Your first recording will feel bad. That is the point — the recording is a diagnostic, not a performance. Pick a random topic, something you have opinions about but have never rehearsed: pitch your dream job, explain why mornings matter, defend an unpopular opinion.

Set up before you press record. Camera at eye level, face lit from the front, phone on silent, door closed. Frame head and shoulders. Then speak for a full 5 minutes without stopping. If you freeze, say what you are thinking out loud — ''I lost my point, let me restart that thought'' — and keep going. Recovery is a skill the camera rewards.

Do not watch it today. Upload or save it, note the topic and date, and walk away. Reviewing same-day triggers self-criticism instead of analysis, and self-criticism teaches nothing.', 'Go to Studio now and record your first 5-minute impromptu on a random topic. No script, no restarts, camera on. Save it and close the app until tomorrow.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 3, 'The 24-hour detachment rule', 'When you watch yourself speak minutes after speaking, your brain is still in performer mode. Every pause feels eternal, every filler feels catastrophic. You are not evaluating — you are reliving embarrassment. That is why the app locks Review for 24 hours, and why you should respect the lock instead of fighting it.

After a day, something shifts. The speaker on screen becomes a stranger you can coach. Pauses look natural instead of shameful. Fillers become countable data instead of character flaws. Psychologists call this self-distancing, and it reliably produces fairer, more accurate self-judgment.

Use the waiting day well. Record a second video on a different topic, or run a 10-minute drill from Practice. The system is designed as a daily loop: record today, review yesterday, drill one weakness. Streaks are built on this rhythm, not on marathon sessions.', 'Open yesterday''s recording in Review. Before pressing play, write down 3 things you EXPECT were bad. After watching, compare. Notice how many fears were exaggerated — that gap is the detachment effect working.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 4, 'Triple-Scan 1: Audio — fillers and pace', 'First scan: listen without watching. Close your eyes or minimize the video and take the audio only. Count every um, uh, like, you know, and so. Write the number down. Most beginners land between 15 and 40 in five minutes, and simply knowing the number cuts it — measurement creates awareness, awareness creates control.

Second pass: pace. Read a 130-word paragraph aloud in one minute — that is 130 words per minute, the low end of the confident range. Most nervous speakers rush past 170. Your target band is 130 to 160. If the AI reports your pace, compare it across recordings, not against perfection.

Do not fix anything yet. Scanning is diagnosis. Write two lines in a notebook: filler count, and whether you rushed, dragged, or varied. That notebook becomes your progress log for the next 30 days.', 'Listen to one recording audio-only. Tally fillers with pen marks and note your pace impression (rushed / steady / dragging). Log both numbers.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 5, 'Triple-Scan 2: Video — body and eyes', 'Second scan: watch muted. Without sound you cannot hide behind content, so the body tells the truth. Watch for four things. Eyes: do they hold the lens or dart away every few seconds? Camera eye contact reads as confidence even when you feel none. Hands: are they visible and purposeful, or hidden, fidgeting, touching your face? Posture: still base with occasional movement, or swaying and pacing? Face: does it match the words, or is it frozen neutral throughout?

Score yourself 1 to 5 on each and pick the lowest. That is next week''s drill target, not today''s worry. One channel at a time — trying to fix eyes, hands, posture, and face simultaneously guarantees you fix none of them.

Record a 60-second muted selfie-video reply to your own recording: nod where the speaker did well, shake where the body leaked nerves. It feels silly. It works.', 'Watch one recording on mute. Score eyes, hands, posture, face from 1-5. Circle the lowest — that is your weakness of the week.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 6, 'Triple-Scan 3: Transcript — structure', 'Third scan: read the transcript like an editor, not the author. Strong impromptu talks have a skeleton: a claim in the first 30 seconds, two or three supporting points with one concrete detail each, and a closing line that echoes the claim. Most beginner transcripts have none of this — they wander, repeat, and trail off.

Mark three things with a pen. Underline the moment you finally state your point — beginners bury it two minutes deep. Bracket each supporting point and check it has proof: a story, a number, or an example. Circle the ending: does it conclude, or just stop?

Structure is the highest-leverage fix in communication. Fillers annoy; missing structure confuses. An audience forgives ums from a speaker with a clear point. Nobody forgives five polished minutes that say nothing.', 'Read your latest transcript. Underline your main claim, bracket each point, check each has one concrete detail. Rewrite the closing line in one sentence.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 7, 'One weakness per week', 'You now have three scan reports: audio, video, transcript. You will be tempted to fix everything Monday. Don''t. Pick the single leak that costs you most — usually fillers, pace, eye contact, or structure — and give it seven days of daily 10-minute drills while everything else runs on autopilot.

Why one? Working memory. Speaking already consumes nearly all of it; adding two conscious corrections overloads the system and all of them collapse. One correction fits alongside normal speech within days, becomes automatic within two weeks, and frees capacity for the next fix. Four weeks, four fixes: that is the 30-day transformation, compounded.

Track effort, not perfection. Log each drill day with a tick and one observed improvement. On day 7, re-scan the same channel and compare numbers. Progress you can measure is motivation you don''t have to manufacture.', 'Choose your ONE weakness for this week from your scans. Schedule 10 minutes daily (same time helps). Log day 1 today.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 8, 'Your 30-day calendar', 'Here is the full map. Week 1: record daily, complete your first triple-scan, pick weakness one (usually fillers). Week 2: keep recording, drill weakness one to automatic, add weakness two (usually pace or structure). Week 3: post your first community video if Pro, drill weakness three (usually body language), re-scan week 1''s channel to bank the win. Week 4: full mock — a 5-minute talk on a hard topic, triple-scanned, compared against day 1.

Rules that protect the plan. Never skip recording two days in a row — streaks die on day two, not day one. Never drill more than 15 minutes — fatigue teaches sloppiness. Never compare your day 5 to someone''s day 500 — compare it to your day 1, where the tape exists to prove the gap.

After day 30, the loop doesn''t end — it becomes maintenance. One recording a week, one scan a month, and the skills stay sharp for interviews, promotions, and stages.', 'Write your 4 weekly focuses on paper: W1 fillers, W2 pace/structure, W3 body, W4 full mock. Tape it where you will see it every morning.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Storytelling for Work', 'storytelling-for-work', 'career', 8, '8 lessons • STAR + presence', false, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=60', NULL, 'STAR answers, hero arcs, and executive presence for interviews and meetings.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 1, 'Why stories beat bullet points', 'Interviewers forget 90% of what candidates say within a day — except stories, which survive for weeks. The reason is architectural: facts live in working memory, stories live in episodic memory, and hiring decisions are made from what survives, not what impressed in the moment.

A story needs only three beats: situation in one line, a choice you made, and a result with a number. ''Our checkout dropped 12% after a redesign. I proposed reverting one flow and A/B testing the rest. Conversion recovered in nine days.'' Thirty seconds, unforgettable.

Audit your last three interview answers or meeting updates. If any was a list of duties instead of a story with a choice and a result, rewrite it in three beats. That rewrite is the whole course in miniature.', 'Take one real achievement and compress it to three beats (situation, choice, result+number) in under 30 seconds. Record it.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 2, 'STAR in 90 seconds', 'STAR — Situation, Task, Action, Result — fails most candidates on proportion, not structure. They spend 60 seconds on situation, 20 on task, 15 on action, and mumble the result. Interviewers weight it in reverse: 80% of their judgment comes from Action and Result.

Budget 90 seconds: 15 on situation, 10 on task, 40 on action (what YOU did, first person, verbs), 25 on result with a number. Time yourself — without a timer you will always overspend on setup because setup feels safe.

End every STAR with a learned line: ''Since then I always…'' It converts a past story into future value, which is what the hire is actually buying.', 'Answer ''Tell me about a hard problem you solved'' in exactly 90 seconds with a 15-10-40-25 split. Record and check the split.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 3, 'The hero arc for ''tell me about yourself''', '''Tell me about yourself'' is not an invitation to recite your resume — it is a request for a trajectory. The winning shape is present, past, future: who you are now in one line, the two or three moves that explain how you got here, and where this role fits next. Two minutes, no more.

Cut ruthlessly. Nobody needs your graduation year, your full job history, or hobbies unless asked. Every sentence must answer the hidden question: why does this background make me the obvious choice for THIS role?

Rehearse it until it sounds unrehearsed. The paradox of the opener: it must be the most polished two minutes you own, delivered as if you just thought of it. Record it five times; keep the version where you smile once.', 'Write your 2-minute present-past-future opener. Record it 3 times, each under 2:10. Keep the best.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 4, 'Numbers that land', 'Vague claims evaporate: ''improved performance significantly'' means nothing. Numbers stick: ''cut load time from 4.2s to 900ms'' is remembered and repeated in hiring debriefs. If you lack exact metrics, use honest ranges — ''roughly 30%'' — or scale — ''a team of 6'', ''3 launches a quarter''.

Collect your numbers before you need them. Open a doc and list every measurable thing from your last two years: revenue touched, costs cut, users served, time saved, team size, error rates moved. Most people discover they have ten solid numbers they never mention.

Attach one number to every story in your bank. A story without a number is an anecdote; a story with one is evidence.', 'List 10 numbers from your last 2 years of work. Attach one to each of your 3 strongest stories.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 5, 'Salary negotiation script', 'Negotiation is lost before it starts by two mistakes: naming a number first, and treating the conversation as conflict. The script: let them anchor, respond with enthusiasm plus a range, justify with market data and your numbers, then go silent. Silence is the move most candidates skip — after your ask, stop talking. The next person to speak loses leverage.

Prepare three lines verbatim. ''I am excited about this role. Based on market data and the scope, I am looking at 18 to 21. Can we make that work?'' Then silence. If pushed: ''What flexibility do you have on base versus joining bonus?'' Never accept on the call — ''Thank you, can I confirm by tomorrow?'' buys thinking time and often a better second offer.

Practice the silence. Record yourself delivering the ask and sitting quiet for ten full seconds. It will feel endless. That feeling is why it works.', 'Write your 3 negotiation lines. Record the ask + 10 seconds of silence. Watch it back without flinching.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 6, 'Meeting presence: updates that get noticed', 'Promotions are decided by people who see you thirty minutes a week. The 30-second update is your instrument: headline first (''Checkout recovery is on track, +4% this week''), one supporting detail, one flag or ask. Headline-first respects busy minds; detail-first buries you.

Speak early. The first ten minutes of a meeting set the perceived hierarchy — a crisp early comment buys attention for everything after. Prepare one comment before recurring meetings: a question, a data point, a decision needed.

Volunteer for the visible artifacts: the recap email, the decision doc, the client demo. Work that isn''t seen isn''t rewarded. Presence is not politics; it is making your real contributions legible.', 'Prepare a 30-second headline-first update about your current work. Deliver it to camera. Then write one comment for your next real meeting.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 7, 'Handling ''weakness'' questions', '''What is your greatest weakness?'' punishes both honesty without growth and growth without honesty. The formula: a real, non-fatal weakness + what it cost you once + the system you built since. ''I used to over-commit — I once took three launches at once and slipped on all of them. Now I keep a one-page capacity sheet and say no with alternatives.''

Never pick a disguised strength (''I work too hard'') — interviewers have heard it ten thousand times and it signals you dodge hard questions. Never pick a fatal flaw for the role (disorganization for ops, conflict-avoidance for sales).

The hidden test is coachability. They are asking: when this person fails, do they build systems or make excuses? Your story must end with a mechanism, not a moral.', 'Write your weakness story: real flaw + one cost + current system. Deliver in 60 seconds, ending on the mechanism.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 8, 'Executive presence checklist', 'Executive presence is not charisma — it is a checklist. Slow down 10%: seniors speak slightly slower than juniors, and pace reads as authority. Replace hedges (''I just think maybe'') with direct claims (''My recommendation is''). Hold silence after key points instead of filling it. Ask the question nobody asked: ''What would have to be true for this to fail?'' — one sharp question outweighs ten safe comments.

Dress one notch above the room, arrive two minutes early, and take notes visibly. These surface signals buy the benefit of the doubt that lets substance land.

Record a 2-minute opinion on an industry trend as if briefing a CEO: recommendation first, two reasons, one risk, one ask. Watch muted after — presence is visible before it is audible.', 'Record a 2-minute CEO-style briefing (recommendation, 2 reasons, 1 risk, 1 ask). Watch muted and score posture, eyes, stillness.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Voice & Body Masterclass', 'voice-body-masterclass', 'creator', 8, '8 lessons • Pace, pause, gesture', false, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60', NULL, 'Pace, pause, vocal variety, eye contact, and a gesture system.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 1, 'The pause drill', 'Fillers are failed pauses. Your brain reaches for ''um'' in the exact moment a confident speaker leaves silence — and audiences read silence as thought, never as failure. Studies of perceived competence show pauses increase authority ratings while fillers decrease them. Same airtime, opposite signal.

The drill is mechanical. Record a 2-minute talk. Every time you feel an um forming, close your mouth and count ''one'' silently. The pause will feel enormous to you and invisible to listeners — playback proves this within one session.

Replace, don''t suppress. Suppression (''don''t say um'') keeps attention on the filler. Replacement (''pause 1.5 seconds'') gives the brain a competing behavior. Three sessions typically cut fillers by half; the scan numbers will show it.', 'Record 3 two-minute takes on one topic. Rule: every um-instinct becomes a 1.5s silent pause. Count fillers per take — watch the number fall.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 2, 'Pace: the 130-160 band', 'Nervous speakers sprint past 170 words per minute; bored speakers drag under 110. The confident band is 130 to 160 — fast enough to hold attention, slow enough to land weight. Most beginners who feel ''too slow'' at 140 are actually perfect; the discomfort is adrenaline, not reality.

Calibrate with a metronome trick: read 130 words in exactly 60 seconds (mark a 130-word passage), then speak your own content chasing that rhythm. Record and compare your AI pace score across sessions — trend matters more than any single number.

Strategic slowness is a tool. Drop to 110 for your key line, then resume. The contrast makes the important sentence feel important — audiences lean in when pace breaks pattern.', 'Read a marked 130-word passage in 60s. Then record 2 minutes of your own content at that rhythm. Check pace, repeat once.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 3, 'Vocal variety: pitch, volume, emphasis', 'Monotone is not a voice problem, it is an emphasis problem. Flat speakers stress every word equally; engaging speakers stress one word per sentence and let the rest fall. Try: ''I have NEVER seen results like THIS.'' Same words, three meanings depending on stress. Audiences follow emphasis like a flashlight.

Three dials to practice. Pitch: let statements fall and questions rise — upspeak on facts sounds uncertain. Volume: drop to near-whisper for the confidential point, then return; contrast beats loudness. Speed: rush the setup, slow the punchline.

Mark one script before recording: underline three emphasis words, star one slow-down line. Constrained practice builds the habit faster than ''be expressive'' ever will.', 'Take 5 sentences. Mark one emphasis word each + one slow line. Record twice — flat first, marked second. Compare.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 4, 'Eye contact on camera', 'On camera, eye contact means lens contact — looking at your own face on screen reads as looking away. Put a small dot next to your lens until the habit forms. Hold the lens through whole thoughts, not words: finish the sentence, then glance to think, then return. Darting every two seconds signals anxiety even when the words are strong.

The 80% rule: lens for four-fifths of the time, notes or thought-glances for the rest. In Q&A, answer to the lens, not to the chat window — everyone feels addressed.

Test yourself: record 60 seconds answering ''what did you learn this week'', then watch muted counting lens-breaks. Under 5 is strong. Over 12, drill the dot technique daily.', 'Record 60 seconds with a dot by the lens. Watch muted, count lens-breaks. Target: under 8 this week, under 5 next.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 5, 'Gestures that support words', 'Hands should illustrate, not decorate. Three gestures cover 90% of speaking: the count (fingers for enumerated points — audiences track numbers visually), the container (hands shaping the size or scope of an idea), and the beat (small downward pulse on the key word). Everything else — fidgeting, pockets, face-touching — is noise.

Keep gestures in the frame box: between waist and shoulders, out from the body. Below-frame hands vanish; above-shoulder flailing distracts. Stillness between gestures matters as much — return hands to rest so each gesture means something.

Record your three-beat achievement story using only count-container-beat gestures. Watch muted: if the hands match the words, the talk feels twice as confident with zero content change.', 'Record your achievement story using only the 3 gestures (count, container, beat). Watch muted — hands must match words.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 6, 'Posture and energy', 'Energy reads through the body before a word lands. Feet planted, weight even, shoulders back and down, chin level with the lens — this base posture raises vocal projection and cuts fidgeting at the source, because a stable base gives nervous energy nowhere to leak.

Match energy to message plus ten percent. Flat delivery of exciting news confuses audiences; oversized energy on serious news alarms them. Record the same 30 seconds twice — once flat, once at 110% — and find your honest middle.

The two-minute reset before any recording: shake out hands, roll shoulders, three slow breaths, one power posture hold. Athletes warm up; speakers should too. Your day-1 tape versus a warmed-up tape will convince you faster than any argument.', 'Do the 2-minute reset (shake, roll, breathe, posture hold), then record the same update twice: flat vs 110%. Keep the middle.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 7, 'The 3-minute voice warmup', 'Cold voices crack, thin out, and tire. A three-minute routine fixes it: one minute of lip trills sliding pitch up and down (engages breath support without strain), one minute of humming scales (warms resonance), one minute of tongue-twisters accelerating (''red lorry, yellow lorry'' faster each round — articulation for consonants that mush under pressure).

Hydrate before, not during: room-temperature water 15 minutes prior beats mid-talk sips that signal nerves. Avoid dairy and excess caffeine right before — both thicken or dry the voice.

Make it a pre-record ritual alongside the posture reset. Five minutes of preparation reliably buys a full grade of perceived confidence, and rituals kill pre-camera jitters by giving nerves a job.', 'Run the full 3-minute warmup (trills, hums, twisters), then immediately record 2 minutes. Compare vocal clarity to a cold take.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 8, 'Putting it together: the 2-minute talk', 'Final exam for this track: a 2-minute talk deploying everything — pause discipline, 130-160 pace, three emphasis marks, lens contact, count-container-beat gestures, base posture. Pick a topic with stakes: why you deserve a raise, why your team should adopt your idea.

Structure it tight: 15-second claim, three 30-second points with one proof each, 15-second close echoing the claim. Constraints force craft — two minutes with a skeleton beats five minutes wandering.

Triple-scan the result and log all three scores beside your day-1 numbers from this same exercise. If you skipped day 1, record it now: the before-tape is the most motivating asset in this entire program.', 'Record the 2-minute talk with full technique + skeleton structure. Triple-scan it. Log audio, video, transcript scores.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Interview OS', 'interview-os', 'career', 6, '6 lessons • FAANG answers', false, 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&auto=format&fit=crop&q=60', NULL, 'FAANG-style STAR answers, salary negotiation, whiteboard communication.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 1, 'The 5 stories every candidate needs', 'Walk into any interview with five banked stories and you can answer 80% of behavioral questions by mapping, not inventing: a hard problem solved, a conflict navigated, a failure and lesson, a time you led without authority, and a proud shipped result. Preparation beats improvisation because stress destroys recall — banked stories survive it.

Write each in three beats with one number. Keep them in a one-page doc you review the morning of. When a surprise question lands, pause, pick the closest story, and bridge: ''That reminds me of when…'' — interviewers reward relevance, not literal matching.

Gaps in your bank are your prep list. Missing a leadership story? That is this week''s recording topic, twice.', 'Write your 5 stories in 3 beats each with one number per story. Identify the weakest — record it as a 90-second STAR.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 2, '''Tell me about yourself'' in 2 minutes', 'Present, past, future in 120 seconds: who you are now (one line with your spike), the two moves that explain your trajectory, and why this role is the obvious next step. Cut everything else — graduation years, full history, hobbies — unless it serves the hire.

Tailor the future line per company using one researched fact: their market, their tech, their problem. ''...which is why your infra scale-up is exactly where I add most'' beats any generic closer and proves you prepared.

Polish until it sounds unpolished. Five recorded takes, keep the one with a single genuine smile. This opener sets the interviewer''s priors — everything after gets filtered through it.', 'Write + record your 2-minute opener 3 times. Each take must end on a company-specific future line.', 15, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 3, 'Behavioral question bank', 'Behavioral rounds draw from a small deck: conflict, failure, ambiguity, tight deadline, disagreement with a manager, mentoring someone, influencing without authority, and handling a mistake in production. Ten questions cover the space — prepare all ten, not thirty.

For each, fix the 90-second STAR with 15-10-40-25 proportions and a learned line at the end. The learned line (''since then I always…'') is what separates seniors: it shows the failure compounded into judgment.

Drill under pressure: have the app''s random topic picker surprise you, or set a 30-second prep timer. Calm recall under a timer is the actual interview skill — content without it collapses.', 'Pick 3 bank questions at random with a 30s prep timer. Answer each in 90s STAR. Log which felt shakiest.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 4, 'Whiteboard communication', 'Interviewers score thinking aloud as heavily as correctness. Narrate structure before detail: ''I''ll clarify constraints, sketch two approaches, then go deep on one.'' Silence while you think reads as stuck; narrated thinking reads as rigorous — same brain, different signal.

Verbalize trade-offs explicitly: ''This is O(n) time for O(1) space; given our read-heavy load I''d take it.'' Trade-off sentences are seniority signals — juniors describe solutions, seniors compare them.

When stuck, say so with a plan: ''I''m blocked on the edge case; let me test with a small example.'' Stuck-with-a-plan beats silent spinning every time. Record a 10-minute mock and count your silent gaps over 5 seconds — drive them to zero.', 'Record 10 minutes solving any problem aloud. Rules: narrate structure first, zero silent gaps over 5s, state one trade-off.', 15, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 5, 'Questions to ask them', '''Do you have questions for us?'' is scored, and ''no'' is a fail. Prepare five, ask two or three: the team''s biggest current challenge, what success looks like at 6 months, why the interviewer stays, how decisions get made, what would make someone fail in this role. Each signals you evaluate them — high-status candidates choose, they don''t beg.

Never ask anything the website answers, anything about perks first, or anything that reveals zero preparation. One compensation question is fine late-stage, framed as scope: ''What is the range budgeted for this level?''

Write your five now, tailored with one researched fact each. Asking a sharp question about their actual roadmap beats any answer you gave all day.', 'Write 5 tailored questions with one researched fact each. Ask 2 aloud to camera as if the interviewer is present.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 6, 'Salary negotiation + closing', 'Never anchor first, never accept on the call. When pressed: enthusiastic + range + data + silence. ''I''m excited about this role — based on market data and scope, I''m looking at 18 to 21. Can we make that work?'' Then say nothing. The silence does the negotiating.

Expand the pie beyond base: joining bonus, review timeline (''revisit comp in 6 months in writing''), equity, remote flexibility. A 6-month review clause often beats a small base bump — and get every promise in the offer letter, never verbal.

Close every process with a 24-hour thank-you note referencing one specific discussion point. It is cheap, rare, and occasionally flips a maybe. Then stop touching the process and let the silence work for you too.', 'Script your range + one pie-expander + silence. Record the delivery. Then draft your thank-you template with a blank for the specific point.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Network Without Fear', 'network-without-fear', 'social', 5, '5 lessons • Small talk system', true, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=60', NULL, 'Small talk, networking, and dating conversations — a system for social confidence.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 1, 'Small talk is a skill, not talent', 'Nobody is born good at small talk — extroverts just got more reps. Treat it as a trained skill with drills, and the anxiety story (''I''m just not a people person'') dissolves within weeks of deliberate practice.

The reframe that unlocks everything: your job is not to be interesting, it is to be interested. People rate conversations by how heard they felt, not by your stories. Curiosity is a learnable technique, not a personality trait.

Start with low stakes: one 30-second exchange daily — a barista, a colleague, a stranger in a lift. Reps at zero stakes build the muscle that high-stakes rooms require. Log each rep with one observed detail about the other person.', 'Have one 30-second low-stakes exchange today. Log what you learned about them in one line.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 2, 'Openers that actually work', 'Forget clever lines — the best openers are situational, specific, and easy to answer. ''What did you think of the keynote''s second half?'' beats ''So what do you do?'' because it shares context and invites opinion, not biography. Observation plus open question: comment on something true in the room, then ask.

Prepare five situational openers before any event: about the venue, the speaker, the food, the crowd, the theme. Walking in armed removes the hardest five seconds — the approach.

Body language opens before words do. Uncross arms, hold your drink low (high drinks create barriers), and smile before speaking — the smile must precede the sentence or it reads as nervous, not warm.', 'Write 5 situational openers for your next event or weekday. Practice approach + smile-first delivery to camera twice.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 3, 'Listen, then ladder', 'Conversations die when people wait-to-talk instead of listening. The ladder technique: take one word from their answer and climb — ''You mentioned Goa — surf or shacks?'' Each rung proves you heard them, and heard people open up, which makes YOU the great conversationalist without performing.

Ask twice before telling once. Two follow-up questions per statement is the ratio — the second question (''and what was the hardest part of that?'') is where real conversation starts; the first only warms up.

Paraphrase to confirm: ''So the launch slipped but the team stayed — that must have been intense.'' Feeling understood is the drug of good conversation. Deal it deliberately.', 'In your next conversation, ask 2 follow-ups per answer and paraphrase once. Note which follow-up opened them up most.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 4, 'Exiting gracefully + follow-up', 'Beginners trap themselves in dying conversations because leaving feels rude. It isn''t — staying past expiry is what feels bad, for both sides. The graceful exit: appreciation + reason + future (''Great chatting — I''m going to grab food, let''s connect on LinkedIn?''). Future-oriented exits preserve warmth.

The follow-up within 24 hours is where networking actually happens — 90% of event value is post-event. One specific line beats generic flattery: ''Loved your point on pricing — trying it Monday.'' Specificity proves attention.

Collect contacts with intent: after each event, message your top three within a day. Networks are built in follow-ups, not handshakes.', 'Script your 3-part exit line. After your next social event, follow up with 2 people within 24h with one specific line each.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 5, 'The 7-day social challenge', 'Knowledge without reps is trivia. Seven days: Day 1 — one low-stakes exchange. Day 2 — opener + 2-minute chat with a colleague. Day 3 — ladder technique in any conversation. Day 4 — compliment a stranger specifically. Day 5 — exit a conversation gracefully on purpose. Day 6 — follow up with someone within 24h. Day 7 — attend or start one group conversation.

Log each day in one line: what you did, what worked, one adjustment. The log matters more than perfection — it converts random courage into a training record your brain trusts.

After day 7, keep the two highest-leverage habits permanently: daily laddering and 24-hour follow-ups. Those two alone outperform 90% of networkers who collect contacts and never write.', 'Start Day 1 today: one 30-second exchange + one-line log. Schedule all 7 days on your calendar now.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Creator Voice Lab', 'creator-voice-lab', 'creator', 7, '7 lessons • Hook + retention', false, 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=600&auto=format&fit=crop&q=60', NULL, 'Reels, podcasts, pitching — hooks, retention, and CTAs that convert.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 1, 'Hooks: the first 3 seconds', 'Viewers decide in three seconds, and the algorithm watches their decision. Open with payoff, not preamble: ''I doubled my salary with one sentence'' beats ''Hey guys, welcome back to my channel'' by orders of magnitude. Cut every intro — start mid-action, mid-claim, mid-story.

Four hook templates cover most content: the bold claim (''Everything you know about X is wrong''), the number (''3 mistakes killing your Y''), the story drop (''Last Tuesday my boss said…''), the question wound (''Still nervous in meetings?''). Rotate them; track which your audience rewards.

Record five hooks for one topic, 5 seconds each, and pick by gut. Hook-writing is a separate muscle from content — train it separately, ten hooks a week, and retention graphs bend within a month.', 'Write 5 hooks (one per template) for your next topic. Record each in 5 seconds. Keep the strongest two.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 2, 'Retention: open loops', 'Retention is curiosity management. An open loop — a promised payoff delivered later (''…and the third mistake cost me a promotion — coming up'') — keeps viewers through the middle where most drop off. Plant one loop in the first 15 seconds and close it near the end.

Cut dead air ruthlessly. Every second that doesn''t earn the next must go: silences over a beat, repeated words, throat-clearing, ''so yeah''. Edit at 1.2x attention — if you get bored watching, they left minutes ago.

Structure for retention: hook, quick roadmap (''three things''), point-proof-point-proof, loop payoff, CTA. Predictability of shape with surprise of content — that combination holds humans.', 'Take one recorded video. Mark every second that doesn''t earn the next. Cut or re-record those segments. Compare lengths.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 3, 'One idea per video', 'Beginner creators cram five ideas into one video and retain none. One video, one idea, one takeaway the viewer can repeat: ''pause before answering''. If your video needs ''and also'', split it — two focused videos outperform one packed one, and you just doubled your content calendar.

Test every script with the repeat-back: could a viewer state your point in one sentence? If not, cut until they can. Clarity is retention; confusion is the swipe.

Depth beats breadth within the one idea: one claim, one story, one proof, one drill. The LINGAUX triple-scan maps perfectly — structure the transcript before you shoot, not after.', 'Take your next topic. Write its one-sentence takeaway first, then allow only content serving it. Cut the rest into future videos.', 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 4, 'CTA without cringe', 'Begging (''smash that button!'') repels; earning converts. The CTA formula: value reminder + single action + reason (''If this pause drill helped, follow for one drill daily — tomorrow is pace''). One action only — follow OR comment OR share; three asks get zero.

Place CTAs at value peaks, not endings. Mid-video after a strong insight converts multiples of end-screen begging, because motivation is highest right after receiving value. Endings get one soft line, maximum.

Match CTA to platform: comments for discussion topics (''what is YOUR filler word?''), follows for series (''day 4 of 30 tomorrow''), shares for identity content people send to friends. Right ask, right place.', 'Write 3 CTAs (comment / follow / share versions) for your next video. Place the strongest mid-video at a value peak.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 5, 'Batching: 5 videos in 1 hour', 'Daily posting dies on daily production. Batching — one hour, five videos — separates creation from performance and multiplies output. Setup once: same light, same frame, same shirt. Then shoot back-to-back with a 2-minute reset between: hooks first for all five, then bodies, then CTAs.

Scripts fit index cards: hook line, three beats, CTA. Full scripts invite reading-eyes; cards invite talking. If you stumble twice on a card, simplify the card, not yourself.

Schedule the batch weekly — same hour, non-negotiable. Consistency is a calendar event, not motivation. Five weekly batches is a 100-video catalog in five months, the actual asset that compounds.', 'This week: one 60-minute batch session. 5 index-card scripts, shoot all five. Log time per video.', 15, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 6, 'Reading comments like data', 'Comments are free market research wearing casual clothes. Sort weekly: questions asked twice become your next videos, objections become content gaps to address, praise patterns reveal your spike (double down there), and trolls get deleted without ceremony — engagement with abuse trains the algorithm wrong.

Reply to early comments within the hour: the algorithm counts velocity, and a creator who answers builds the community that retains. Pin the best question-comment — it seeds ten more.

Track one metric per month, not ten: 90-day follower growth, or average watch time, or saves per video. One north star beats a dashboard of noise.', 'Audit your last 10 comments: list repeated questions (video ideas), objections (gaps), praise (your spike). Reply to 3 today.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 7, 'Your 30-day posting calendar', 'Final build: a 30-day calendar mixing proven formats — 40% teaching (one idea + drill), 30% story (your journey, failures included), 20% trends (your take within 48 hours), 10% community (Q&A, duets, replies). Ratio prevents both boredom and burnout.

Batch weekly, post at your audience''s peak hour (check analytics, default to 7-9pm IST for India), and review retention graphs every Sunday: where do viewers leave? That timestamp is your curriculum — fix exits first, polish intros second.

Day 30 deliverable: 20+ posted videos, one retention graph you understand, and three proven hooks to reuse. That is a creator foundation most people take a year to build.', 'Draft your 30-day calendar: 12 teaching, 9 story, 6 trend, 3 community slots with topics. Schedule batch hours.', 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

-- Verify:
-- SELECT c.slug, count(l.id) AS lessons FROM "Course" c LEFT JOIN "Lesson" l ON l."courseId" = c.id GROUP BY c.slug ORDER BY c.slug;

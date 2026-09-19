-- Run this in Supabase -> SQL Editor (production database).
-- LINGAUX : Academy lesson system v2 (expanded content + videoUrl support).
-- Safe to re-run? YES - idempotent (upserts by slug / courseId+order).

ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'The 30-Day Game Plan', '30-day-game-plan', 'general', 8, '8 lessons • LINGAUX method', true, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60', NULL, 'The science-backed loop: record 5-min, wait 24h, triple-scan, fix 1/week. Your foundation.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 1, 'How the loop works', 'Most people practice speaking the way they practice everything else: they repeat what feels comfortable and avoid what feels awkward. That is why years of meetings and presentations often produce zero improvement — the discomfort is avoided, so the data never arrives.

The LINGAUX loop fixes this with four steps. First, you record a 5-minute impromptu talk with no script. Second, you wait 24 hours before reviewing it. Third, you triple-scan the recording: audio for fillers and pace, video muted for body language, transcript for structure. Fourth, you pick exactly one weakness and drill it for a week.

Each step has a reason backed by learning science. Impromptu recording forces retrieval under pressure, which is when real habits show. The 24-hour wait creates psychological distance so you judge the speaker, not yourself. Triple-scanning separates channels your brain normally blends together. And single-focus practice beats scattered effort because attention is finite.

EXAMPLE
Two employees give the same monthly update for a year. One records, reviews, and drills weekly; the other just speaks. After twelve months the first delivers a promotion-ready briefing; the second delivers the same update with better slides. The difference is the loop.

COMMON MISTAKES
• Reviewing same-day — turns analysis into self-criticism; wait 24 hours.
• Drilling five weaknesses at once — overloads working memory and all five collapse. Pick one.
• Skipping recordings after a bad session — the bad tape is the most valuable data you own.

KEY TAKEAWAYS
• The loop: Record → Wait 24h → Triple-Scan → Fix ONE weakness.
• Discomfort is the data — avoided discomfort means zero improvement.
• Four weeks, four fixes, compounded: that is the 30-day transformation.

SCRIPT TO STEAL
“Today I record. Tomorrow I review. This week I fix ONE thing: ___.”', 'Write the four steps on paper from memory: Record, Wait, Scan, Fix. Under each, write one sentence explaining WHY it exists. 5 minutes.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 2, 'Your first 5-minute recording', 'Your first recording will feel bad. That is the point — the recording is a diagnostic, not a performance. Pick a random topic, something you have opinions about but have never rehearsed: pitch your dream job, explain why mornings matter, defend an unpopular opinion.

Set up before you press record. Camera at eye level, face lit from the front, phone on silent, door closed. Frame head and shoulders. Then speak for a full 5 minutes without stopping. If you freeze, say what you are thinking out loud — ''I lost my point, let me restart that thought'' — and keep going. Recovery is a skill the camera rewards.

Do not watch it today. Upload or save it, note the topic and date, and walk away. Reviewing same-day triggers self-criticism instead of analysis, and self-criticism teaches nothing.

EXAMPLE
A beginner freezes at forty seconds and stops. A trained beginner says out loud, ‘I lost my point — let me restart that thought,’ recovers, and finishes four minutes. The second tape is a coaching goldmine; the first teaches nothing. Recovery is the skill the camera rewards.

COMMON MISTAKES
• Scripting the talk — scripted delivery hides your real habits from the scan.
• Stopping on a freeze — say the restart out loud and keep going; the tape needs the recovery.
• Watching it the same day — you relive embarrassment instead of analyzing. Save and walk away.

KEY TAKEAWAYS
• The recording is a diagnostic, not a performance.
• Setup matters: camera at eye level, face lit from the front, frame head-and-shoulders.
• A full 5 minutes with a recovery beats 2 perfect minutes with a stop.

SCRIPT TO STEAL
“I lost my point — let me restart that thought: ___.”', 'Go to Studio now and record your first 5-minute impromptu on a random topic. No script, no restarts, camera on. Save it and close the app until tomorrow.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 3, 'The 24-hour detachment rule', 'When you watch yourself speak minutes after speaking, your brain is still in performer mode. Every pause feels eternal, every filler feels catastrophic. You are not evaluating — you are reliving embarrassment. That is why the app locks Review for 24 hours, and why you should respect the lock instead of fighting it.

After a day, something shifts. The speaker on screen becomes a stranger you can coach. Pauses look natural instead of shameful. Fillers become countable data instead of character flaws. Psychologists call this self-distancing, and it reliably produces fairer, more accurate self-judgment.

Use the waiting day well. Record a second video on a different topic, or run a 10-minute drill from Practice. The system is designed as a daily loop: record today, review yesterday, drill one weakness. Streaks are built on this rhythm, not on marathon sessions.

EXAMPLE
The same recording, reviewed twice. Day 0: ‘I sounded terrible, I mumbled everything.’ Day 1: ‘Three fillers in the first minute, strong point at 0:40, ending trailed off.’ The tape did not change — the distance did. That gap is the detachment effect working for you.

COMMON MISTAKES
• Fighting the 24h lock — early reviews reliably produce harsher, less accurate judgment.
• Reliving instead of analyzing — watch as a coach coaching a stranger, not the performer.
• Wasting the wait day — use it: a second recording on a new topic, or one 10-minute drill.

KEY TAKEAWAYS
• Self-distancing: after 24 hours you judge the speaker, not yourself.
• Expectation vs reality: write 3 fears before watching — most will not survive.
• The daily loop: record today, review yesterday, drill one weakness.

SCRIPT TO STEAL
“The person on screen is a stranger I can coach.”', 'Open yesterday''s recording in Review. Before pressing play, write down 3 things you EXPECT were bad. After watching, compare. Notice how many fears were exaggerated — that gap is the detachment effect working.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 4, 'Triple-Scan 1: Audio — fillers and pace', 'First scan: listen without watching. Close your eyes or minimize the video and take the audio only. Count every um, uh, like, you know, and so. Write the number down. Most beginners land between 15 and 40 in five minutes, and simply knowing the number cuts it — measurement creates awareness, awareness creates control.

Second pass: pace. Read a 130-word paragraph aloud in one minute — that is 130 words per minute, the low end of the confident range. Most nervous speakers rush past 170. Your target band is 130 to 160. If the AI reports your pace, compare it across recordings, not against perfection.

Do not fix anything yet. Scanning is diagnosis. Write two lines in a notebook: filler count, and whether you rushed, dragged, or varied. That notebook becomes your progress log for the next 30 days.

EXAMPLE
A founder counts 31 fillers in a five-minute pitch. Knowing the number alone, the next recording lands at 12 — no other change. Measurement creates awareness, awareness creates control. That is why the scan comes before any fix.

COMMON MISTAKES
• Suppressing ums (‘don’t say um’) — keeps attention on the filler. Replace with a 1.5s pause instead.
• Scanning audio with the video on — close your eyes; content hides nothing and blends the channels.
• Scanning without a log — write filler count + pace impression every time; the log IS the progress.

KEY TAKEAWAYS
• Count creates awareness; awareness creates control.
• Target band 130–160 wpm — beginners who feel ‘too slow’ at 140 are usually perfect.
• Diagnosis first, fixes later — never both in the same session.

SCRIPT TO STEAL
“Baseline: __ fillers in 5 minutes. This week’s target: under __.”', 'Listen to one recording audio-only. Tally fillers with pen marks and note your pace impression (rushed / steady / dragging). Log both numbers.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 5, 'Triple-Scan 2: Video — body and eyes', 'Second scan: watch muted. Without sound you cannot hide behind content, so the body tells the truth. Watch for four things. Eyes: do they hold the lens or dart away every few seconds? Camera eye contact reads as confidence even when you feel none. Hands: are they visible and purposeful, or hidden, fidgeting, touching your face? Posture: still base with occasional movement, or swaying and pacing? Face: does it match the words, or is it frozen neutral throughout?

Score yourself 1 to 5 on each and pick the lowest. That is next week''s drill target, not today''s worry. One channel at a time — trying to fix eyes, hands, posture, and face simultaneously guarantees you fix none of them.

Record a 60-second muted selfie-video reply to your own recording: nod where the speaker did well, shake where the body leaked nerves. It feels silly. It works.

EXAMPLE
Muted, a speaker notices their eyes dart every two seconds and their hands hide at their sides — both invisible with sound on, because content steals attention. The lowest score becomes the week’s single drill target, not today’s worry.

COMMON MISTAKES
• Watching with sound — content masks body language; the muted watch is the whole point.
• Scoring all four channels at once — eyes, hands, posture, face separately; fix only the lowest.
• Ignoring stillness — a still base between gestures is what makes each gesture mean something.

KEY TAKEAWAYS
• Muted watch: the body tells the truth when the words can’t hide it.
• Score eyes, hands, posture, face 1–5; the lowest is next week’s drill.
• Camera eye contact reads as confidence even when you feel none.

SCRIPT TO STEAL
“Eyes __, hands __, posture __, face __. Weakest: ___ — that’s this week’s fix.”', 'Watch one recording on mute. Score eyes, hands, posture, face from 1-5. Circle the lowest — that is your weakness of the week.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 6, 'Triple-Scan 3: Transcript — structure', 'Third scan: read the transcript like an editor, not the author. Strong impromptu talks have a skeleton: a claim in the first 30 seconds, two or three supporting points with one concrete detail each, and a closing line that echoes the claim. Most beginner transcripts have none of this — they wander, repeat, and trail off.

Mark three things with a pen. Underline the moment you finally state your point — beginners bury it two minutes deep. Bracket each supporting point and check it has proof: a story, a number, or an example. Circle the ending: does it conclude, or just stop?

Structure is the highest-leverage fix in communication. Fillers annoy; missing structure confuses. An audience forgives ums from a speaker with a clear point. Nobody forgives five polished minutes that say nothing.

EXAMPLE
A transcript’s main point arrives at 2:10 of a four-minute talk. Moved to the first 30 seconds, with one concrete detail attached to each point, the same content reads twice as persuasive. Structure is the highest-leverage fix in communication — fillers annoy; missing structure confuses.

COMMON MISTAKES
• Reading as the author — read like an editor: you defend, editors cut.
• Points without proof — every point needs a story, a number, or an example attached.
• Ending without concluding — a talk that just stops feels unfinished; echo the opening claim.

KEY TAKEAWAYS
• Claim in the first 30 seconds — beginners bury it two minutes deep.
• Skeleton: claim → 2–3 points, one proof each → close that echoes the claim.
• Audiences forgive ums from a speaker with a clear point — never five polished minutes that say nothing.

SCRIPT TO STEAL
“Claim: ___. Proof 1: ___. Proof 2: ___. Close (echo): ___.”', 'Read your latest transcript. Underline your main claim, bracket each point, check each has one concrete detail. Rewrite the closing line in one sentence.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 7, 'One weakness per week', 'You now have three scan reports: audio, video, transcript. You will be tempted to fix everything Monday. Don''t. Pick the single leak that costs you most — usually fillers, pace, eye contact, or structure — and give it seven days of daily 10-minute drills while everything else runs on autopilot.

Why one? Working memory. Speaking already consumes nearly all of it; adding two conscious corrections overloads the system and all of them collapse. One correction fits alongside normal speech within days, becomes automatic within two weeks, and frees capacity for the next fix. Four weeks, four fixes: that is the 30-day transformation, compounded.

Track effort, not perfection. Log each drill day with a tick and one observed improvement. On day 7, re-scan the same channel and compare numbers. Progress you can measure is motivation you don''t have to manufacture.

EXAMPLE
Week 1 fillers: 31 to 12. Week 2 pace: 172 to 148 wpm. Week 3 eye contact: darting every two seconds to holding through whole thoughts. Four small wins compound into a speaker who sounds promoted — and one-at-a-time is the only way they come.

COMMON MISTAKES
• Fixing everything on Monday — working memory cannot run two conscious corrections mid-speech; both collapse.
• Drilling past 15 minutes — fatigue teaches sloppiness; ten focused minutes win.
• Comparing yourself to others — compare to your day-1 tape; the gap you can see is motivation you don’t have to manufacture.

KEY TAKEAWAYS
• One correction fits alongside normal speech within days; automatic within two weeks.
• Track effort (a daily tick + one observed improvement), not perfection.
• Re-scan the same channel on day 7 — measured progress is the reward.

SCRIPT TO STEAL
“This week: ONE leak — ___. Everything else runs on autopilot.”', 'Choose your ONE weakness for this week from your scans. Schedule 10 minutes daily (same time helps). Log day 1 today.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='30-day-game-plan'), 8, 'Your 30-day calendar', 'Here is the full map. Week 1: record daily, complete your first triple-scan, pick weakness one (usually fillers). Week 2: keep recording, drill weakness one to automatic, add weakness two (usually pace or structure). Week 3: post your first community video if Pro, drill weakness three (usually body language), re-scan week 1''s channel to bank the win. Week 4: full mock — a 5-minute talk on a hard topic, triple-scanned, compared against day 1.

Rules that protect the plan. Never skip recording two days in a row — streaks die on day two, not day one. Never drill more than 15 minutes — fatigue teaches sloppiness. Never compare your day 5 to someone''s day 500 — compare it to your day 1, where the tape exists to prove the gap.

After day 30, the loop doesn''t end — it becomes maintenance. One recording a week, one scan a month, and the skills stay sharp for interviews, promotions, and stages.

EXAMPLE
Day-1 tape versus day-28 tape, same topic, triple-scanned: fillers down 60%, pace in the band, lens contact held, structure with a clear claim and proof. That before/after pair is the single most motivating asset in this entire program — which is why day 1 gets recorded today.

COMMON MISTAKES
• Skipping two days in a row — streaks die on day two, not day one.
• Marathon sessions — 10–15 focused minutes beat a 90-minute Sunday binge; fatigue teaches sloppiness.
• No before-tape — without day 1, progress has no proof and no fuel.

KEY TAKEAWAYS
• W1 fillers, W2 pace/structure, W3 body, W4 full mock against day 1.
• After day 30 the loop becomes maintenance: one recording a week keeps skills sharp.
• Compare to your day 1, never to someone else’s day 500.

SCRIPT TO STEAL
“W1 ___, W2 ___, W3 ___, W4 full mock. Day-1 tape: saved.”', 'Write your 4 weekly focuses on paper: W1 fillers, W2 pace/structure, W3 body, W4 full mock. Tape it where you will see it every morning.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Storytelling for Work', 'storytelling-for-work', 'career', 8, '8 lessons • STAR + presence', false, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=60', NULL, 'STAR answers, hero arcs, and executive presence for interviews and meetings.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 1, 'Why stories beat bullet points', 'Interviewers forget 90% of what candidates say within a day — except stories, which survive for weeks. The reason is architectural: facts live in working memory, stories live in episodic memory, and hiring decisions are made from what survives, not what impressed in the moment.

A story needs only three beats: situation in one line, a choice you made, and a result with a number. ''Our checkout dropped 12% after a redesign. I proposed reverting one flow and A/B testing the rest. Conversion recovered in nine days.'' Thirty seconds, unforgettable.

Audit your last three interview answers or meeting updates. If any was a list of duties instead of a story with a choice and a result, rewrite it in three beats. That rewrite is the whole course in miniature.

EXAMPLE
Two candidates answer ‘tell me about a hard problem.’ One lists duties. The other says: ‘Checkout dropped 12% after a redesign. I proposed reverting one flow and A/B testing the rest. Conversion recovered in nine days.’ Thirty seconds, unforgettable — that is who survives the hiring debrief.

COMMON MISTAKES
• Listing duties instead of a story — duties describe; a story with a choice and a result persuades.
• No number in the result — a story without one is an anecdote; with one, it is evidence.
• Stories that run long — three beats in thirty seconds; length kills memorability.

KEY TAKEAWAYS
• Interviewers forget 90% of what candidates say within a day — except stories, which survive for weeks.
• Three beats: situation in one line, the choice you made, result with a number.
• Audit your last three answers — any list of duties gets rewritten in three beats.

SCRIPT TO STEAL
“___ dropped __% after ___. I ___. Result: ___ in __ days.”', 'Take one real achievement and compress it to three beats (situation, choice, result+number) in under 30 seconds. Record it.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 2, 'STAR in 90 seconds', 'STAR — Situation, Task, Action, Result — fails most candidates on proportion, not structure. They spend 60 seconds on situation, 20 on task, 15 on action, and mumble the result. Interviewers weight it in reverse: 80% of their judgment comes from Action and Result.

Budget 90 seconds: 15 on situation, 10 on task, 40 on action (what YOU did, first person, verbs), 25 on result with a number. Time yourself — without a timer you will always overspend on setup because setup feels safe.

End every STAR with a learned line: ''Since then I always…'' It converts a past story into future value, which is what the hire is actually buying.

EXAMPLE
A candidate budgets 15-10-40-25. The interviewer leans forward through the forty-second action — ‘what I did’ is 80% of the judgment — and the twenty-five-second result with a number closes it clean. Ninety seconds, remembered a week later.

COMMON MISTAKES
• Spending 60 seconds on situation — setup feels safe, but interviewers weight action and result in reverse.
• Mumbling the result — the result IS the answer; land it with a number.
• No learned line — ‘since then I always…’ converts a past story into future value, which is what the hire buys.

KEY TAKEAWAYS
• Budget 90 seconds: 15 situation, 10 task, 40 action (first person, verbs), 25 result.
• Time yourself — without a timer you will always overspend on setup.
• End every STAR with a learned line: ‘Since then I always…’

SCRIPT TO STEAL
“15s situation. 10s task. 40s what I did. 25s result + ‘since then I always ___.’”', 'Answer ''Tell me about a hard problem you solved'' in exactly 90 seconds with a 15-10-40-25 split. Record and check the split.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 3, 'The hero arc for ''tell me about yourself''', '''Tell me about yourself'' is not an invitation to recite your resume — it is a request for a trajectory. The winning shape is present, past, future: who you are now in one line, the two or three moves that explain how you got here, and where this role fits next. Two minutes, no more.

Cut ruthlessly. Nobody needs your graduation year, your full job history, or hobbies unless asked. Every sentence must answer the hidden question: why does this background make me the obvious choice for THIS role?

Rehearse it until it sounds unrehearsed. The paradox of the opener: it must be the most polished two minutes you own, delivered as if you just thought of it. Record it five times; keep the version where you smile once.

EXAMPLE
‘I’m a backend engineer who ships payment systems. Before that I taught math for two years — that’s where I learned to explain complexity. That’s why your infra scale-up is exactly where I add most.’ Present, past, future — two minutes, and the interviewer’s priors are set in your favor.

COMMON MISTAKES
• Reciting the resume — the question asks for a trajectory, not a biography.
• Graduation years, full history, hobbies — cut everything that does not serve the hire.
• No future line — every sentence must answer: why does this background make me obvious for THIS role?

KEY TAKEAWAYS
• Present (one line with your spike) → past (2–3 moves) → future (why this role). Two minutes.
• Tailor the future line per company with one researched fact.
• Polish until it sounds unrehearsed: five recorded takes, keep the one with one genuine smile.

SCRIPT TO STEAL
“Now I ___. Before that ___ and ___. That’s why this role: ___.”', 'Write your 2-minute present-past-future opener. Record it 3 times, each under 2:10. Keep the best.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 4, 'Numbers that land', 'Vague claims evaporate: ''improved performance significantly'' means nothing. Numbers stick: ''cut load time from 4.2s to 900ms'' is remembered and repeated in hiring debriefs. If you lack exact metrics, use honest ranges — ''roughly 30%'' — or scale — ''a team of 6'', ''3 launches a quarter''.

Collect your numbers before you need them. Open a doc and list every measurable thing from your last two years: revenue touched, costs cut, users served, time saved, team size, error rates moved. Most people discover they have ten solid numbers they never mention.

Attach one number to every story in your bank. A story without a number is an anecdote; a story with one is evidence.

EXAMPLE
‘Improved performance significantly’ evaporates by lunch. ‘Cut load time from 4.2s to 900ms’ gets repeated in the hiring debrief a week later. Same achievement — one number turns it into evidence the decision-makers can repeat.

COMMON MISTAKES
• Vague claims (‘significantly’, ‘a lot’) — nobody can repeat vague, so nobody remembers it.
• No numbers collected — most people have ten solid numbers they never mention; open the doc and list them.
• Dishonest precision — if you don’t know exactly, use honest ranges: ‘roughly 30%’, ‘a team of six’.

KEY TAKEAWAYS
• Exact numbers stick; vague claims evaporate.
• Collect before you need them: revenue touched, costs cut, users served, time saved, team size.
• Attach one number to every story in your bank.

SCRIPT TO STEAL
“From ___ to ___ in ___. A team of ___. ___ launches a quarter.”', 'List 10 numbers from your last 2 years of work. Attach one to each of your 3 strongest stories.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 5, 'Salary negotiation script', 'Negotiation is lost before it starts by two mistakes: naming a number first, and treating the conversation as conflict. The script: let them anchor, respond with enthusiasm plus a range, justify with market data and your numbers, then go silent. Silence is the move most candidates skip — after your ask, stop talking. The next person to speak loses leverage.

Prepare three lines verbatim. ''I am excited about this role. Based on market data and the scope, I am looking at 18 to 21. Can we make that work?'' Then silence. If pushed: ''What flexibility do you have on base versus joining bonus?'' Never accept on the call — ''Thank you, can I confirm by tomorrow?'' buys thinking time and often a better second offer.

Practice the silence. Record yourself delivering the ask and sitting quiet for ten full seconds. It will feel endless. That feeling is why it works.

EXAMPLE
‘I’m excited about this role. Based on market data and the scope, I’m looking at 18 to 21. Can we make that work?’ — then ten full seconds of silence. The recruiter speaks first, and the second offer is usually better than the first.

COMMON MISTAKES
• Naming a number first — whoever anchors first loses leverage.
• Treating it as conflict — enthusiasm plus a range plus data reads as confident, not difficult.
• Accepting on the call — ‘Thank you, can I confirm by tomorrow?’ buys thinking time and often a better offer.

KEY TAKEAWAYS
• Let them anchor. Respond: enthusiasm + range + market data + silence.
• Expand the pie: joining bonus, review timeline, equity, remote flexibility.
• Get every promise in the offer letter — never verbal.

SCRIPT TO STEAL
“I’m excited. Based on market data: __ to __. Can we make that work? [then silence]”', 'Write your 3 negotiation lines. Record the ask + 10 seconds of silence. Watch it back without flinching.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 6, 'Meeting presence: updates that get noticed', 'Promotions are decided by people who see you thirty minutes a week. The 30-second update is your instrument: headline first (''Checkout recovery is on track, +4% this week''), one supporting detail, one flag or ask. Headline-first respects busy minds; detail-first buries you.

Speak early. The first ten minutes of a meeting set the perceived hierarchy — a crisp early comment buys attention for everything after. Prepare one comment before recurring meetings: a question, a data point, a decision needed.

Volunteer for the visible artifacts: the recap email, the decision doc, the client demo. Work that isn''t seen isn''t rewarded. Presence is not politics; it is making your real contributions legible.

EXAMPLE
‘Checkout recovery is on track, +4% this week. One detail: the reverted flow held. One ask: design review Thursday.’ Thirty seconds, headline first — and the room’s attention is yours for everything that follows.

COMMON MISTAKES
• Detail-first updates — busy minds need the headline first; detail-first buries you.
• Speaking late — the first ten minutes set the perceived hierarchy; prepare one early comment.
• Invisible work — the recap email, the decision doc, the client demo are the visible artifacts; volunteer for them.

KEY TAKEAWAYS
• The 30-second update: headline, one supporting detail, one flag or ask.
• Speak early — prepare one comment before recurring meetings.
• Presence is not politics; it is making your real contributions legible.

SCRIPT TO STEAL
“Headline: ___ on track, +__ this week. One detail: ___. One ask: ___.”', 'Prepare a 30-second headline-first update about your current work. Deliver it to camera. Then write one comment for your next real meeting.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 7, 'Handling ''weakness'' questions', '''What is your greatest weakness?'' punishes both honesty without growth and growth without honesty. The formula: a real, non-fatal weakness + what it cost you once + the system you built since. ''I used to over-commit — I once took three launches at once and slipped on all of them. Now I keep a one-page capacity sheet and say no with alternatives.''

Never pick a disguised strength (''I work too hard'') — interviewers have heard it ten thousand times and it signals you dodge hard questions. Never pick a fatal flaw for the role (disorganization for ops, conflict-avoidance for sales).

The hidden test is coachability. They are asking: when this person fails, do they build systems or make excuses? Your story must end with a mechanism, not a moral.

EXAMPLE
‘I used to over-commit — I took three launches at once and slipped on all of them. Now I keep a one-page capacity sheet and say no with alternatives.’ Real flaw, real cost, current system — that is the coachability answer interviewers are fishing for.

COMMON MISTAKES
• Disguised strengths (‘I work too hard’) — heard ten thousand times; it signals you dodge hard questions.
• A fatal flaw for the role — disorganization for ops, conflict-avoidance for sales.
• Ending on a moral — end on the mechanism, not the lesson-slogan.

KEY TAKEAWAYS
• Formula: real, non-fatal weakness + what it cost you once + the system you built since.
• The hidden test is coachability: when you fail, do you build systems or excuses?
• The story must end with a mechanism.

SCRIPT TO STEAL
“I used to ___. It cost me ___ once. Now I keep ___ and say no with ___.”', 'Write your weakness story: real flaw + one cost + current system. Deliver in 60 seconds, ending on the mechanism.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='storytelling-for-work'), 8, 'Executive presence checklist', 'Executive presence is not charisma — it is a checklist. Slow down 10%: seniors speak slightly slower than juniors, and pace reads as authority. Replace hedges (''I just think maybe'') with direct claims (''My recommendation is''). Hold silence after key points instead of filling it. Ask the question nobody asked: ''What would have to be true for this to fail?'' — one sharp question outweighs ten safe comments.

Dress one notch above the room, arrive two minutes early, and take notes visibly. These surface signals buy the benefit of the doubt that lets substance land.

Record a 2-minute opinion on an industry trend as if briefing a CEO: recommendation first, two reasons, one risk, one ask. Watch muted after — presence is visible before it is audible.

EXAMPLE
A VP briefs a CEO: ‘My recommendation is plan B. Two reasons: cost and timeline. One risk: vendor lock-in. What would have to be true for this to fail?’ Recommendation first, direct claims, one sharp question — presence is a checklist, not charisma.

COMMON MISTAKES
• Hedges (‘I just think maybe’) — replace with direct claims: ‘My recommendation is’.
• Filling silence — hold it after key points; the pause reads as authority.
• Safe questions only — one sharp question outweighs ten safe comments.

KEY TAKEAWAYS
• Slow down 10% — seniors speak slightly slower than juniors; pace reads as authority.
• Dress one notch above the room, arrive two minutes early, take notes visibly.
• Record a CEO-style briefing: recommendation, two reasons, one risk, one ask.

SCRIPT TO STEAL
“My recommendation is ___. Two reasons: ___. One risk: ___. What would have to be true for this to fail?”', 'Record a 2-minute CEO-style briefing (recommendation, 2 reasons, 1 risk, 1 ask). Watch muted and score posture, eyes, stillness.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Voice & Body Masterclass', 'voice-body-masterclass', 'creator', 8, '8 lessons • Pace, pause, gesture', false, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=60', NULL, 'Pace, pause, vocal variety, eye contact, and a gesture system.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 1, 'The pause drill', 'Fillers are failed pauses. Your brain reaches for ''um'' in the exact moment a confident speaker leaves silence — and audiences read silence as thought, never as failure. Studies of perceived competence show pauses increase authority ratings while fillers decrease them. Same airtime, opposite signal.

The drill is mechanical. Record a 2-minute talk. Every time you feel an um forming, close your mouth and count ''one'' silently. The pause will feel enormous to you and invisible to listeners — playback proves this within one session.

Replace, don''t suppress. Suppression (''don''t say um'') keeps attention on the filler. Replacement (''pause 1.5 seconds'') gives the brain a competing behavior. Three sessions typically cut fillers by half; the scan numbers will show it.

EXAMPLE
Take 1: fourteen fillers. Take 3, same topic, pause rule enforced: six. Same airtime — the pauses felt enormous to the speaker and were invisible to the listeners. One playback session proves it, and that proof is what locks the habit in.

COMMON MISTAKES
• Suppressing (‘don’t say um’) — keeps attention on the filler. Replace it with a 1.5s pause instead.
• Treating pauses as failure — audiences read silence as thought, never as weakness.
• Fixing everything in one session — pause discipline first; pace and variety are separate drills.

KEY TAKEAWAYS
• Fillers are failed pauses — the um-instinct becomes a 1.5-second silent pause.
• Playback in one session proves the pause is invisible — that proof is the habit hook.
• Three sessions typically cut fillers by half; the scan numbers show it.

SCRIPT TO STEAL
“Every um-instinct becomes a 1.5s pause. Take 1: __ fillers. Take 3: __.”', 'Record 3 two-minute takes on one topic. Rule: every um-instinct becomes a 1.5s silent pause. Count fillers per take — watch the number fall.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 2, 'Pace: the 130-160 band', 'Nervous speakers sprint past 170 words per minute; bored speakers drag under 110. The confident band is 130 to 160 — fast enough to hold attention, slow enough to land weight. Most beginners who feel ''too slow'' at 140 are actually perfect; the discomfort is adrenaline, not reality.

Calibrate with a metronome trick: read 130 words in exactly 60 seconds (mark a 130-word passage), then speak your own content chasing that rhythm. Record and compare your AI pace score across sessions — trend matters more than any single number.

Strategic slowness is a tool. Drop to 110 for your key line, then resume. The contrast makes the important sentence feel important — audiences lean in when pace breaks pattern.

EXAMPLE
A nervous speaker reads 130 words in exactly sixty seconds, then chases that rhythm for two minutes — the AI reports 141 wpm where they ‘felt too slow.’ The discomfort is adrenaline, not reality. The band is 130–160; the feeling lies.

COMMON MISTAKES
• Sprinting past 170 wpm — nervous speed reads as panic; the confident band is 130–160.
• Trusting feeling over measurement — the AI pace score across sessions is the trend that matters.
• Constant pace throughout — drop to 110 for the key line, then resume; contrast makes it land.

KEY TAKEAWAYS
• Calibrate: 130 words in 60 seconds, then chase that rhythm with your own content.
• 130–160 is the confident band — fast enough to hold attention, slow enough to land weight.
• Strategic slowness: break the pace pattern on the sentence that matters.

SCRIPT TO STEAL
“130 words in 60 seconds. Key line at 110 — then resume.”', 'Read a marked 130-word passage in 60s. Then record 2 minutes of your own content at that rhythm. Check pace, repeat once.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 3, 'Vocal variety: pitch, volume, emphasis', 'Monotone is not a voice problem, it is an emphasis problem. Flat speakers stress every word equally; engaging speakers stress one word per sentence and let the rest fall. Try: ''I have NEVER seen results like THIS.'' Same words, three meanings depending on stress. Audiences follow emphasis like a flashlight.

Three dials to practice. Pitch: let statements fall and questions rise — upspeak on facts sounds uncertain. Volume: drop to near-whisper for the confidential point, then return; contrast beats loudness. Speed: rush the setup, slow the punchline.

Mark one script before recording: underline three emphasis words, star one slow-down line. Constrained practice builds the habit faster than ''be expressive'' ever will.

EXAMPLE
‘I have never seen results like this’ — three different meanings depending on which word carries the stress. Mark one emphasis word per sentence and one slow-down line; the marked take sounds twice as engaged with zero content change.

COMMON MISTAKES
• Stressing every word equally — monotone is an emphasis problem, not a voice problem.
• Upspeak on statements — statements fall, questions rise; rising facts sound uncertain.
• ‘Be expressive’ without marks — constrained practice (marked scripts) builds the habit faster than vibes.

KEY TAKEAWAYS
• One emphasis word per sentence; let the rest fall away.
• Three dials: pitch (fall/rise), volume (drop for the confidential point), speed (rush setup, slow punchline).
• Mark scripts before recording: underline three emphasis words, star one slow-down line.

SCRIPT TO STEAL
“I have NEVER seen results like THIS. + one slow-down line per script.”', 'Take 5 sentences. Mark one emphasis word each + one slow line. Record twice — flat first, marked second. Compare.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 4, 'Eye contact on camera', 'On camera, eye contact means lens contact — looking at your own face on screen reads as looking away. Put a small dot next to your lens until the habit forms. Hold the lens through whole thoughts, not words: finish the sentence, then glance to think, then return. Darting every two seconds signals anxiety even when the words are strong.

The 80% rule: lens for four-fifths of the time, notes or thought-glances for the rest. In Q&A, answer to the lens, not to the chat window — everyone feels addressed.

Test yourself: record 60 seconds answering ''what did you learn this week'', then watch muted counting lens-breaks. Under 5 is strong. Over 12, drill the dot technique daily.

EXAMPLE
A dot beside the lens, and sixty seconds later the count of lens-breaks drops from fourteen to four. Looking at your own face on screen reads as looking away — the lens is the audience’s eyes, and it is the cheapest confidence upgrade on camera.

COMMON MISTAKES
• Watching your own face on screen — that reads as looking away; put a dot by the lens.
• Darting every two seconds — hold the lens through whole thoughts, then glance to think, then return.
• Zero lens contact in Q&A — answer to the lens, not the chat window; everyone feels addressed.

KEY TAKEAWAYS
• Lens contact = camera confidence; the 80% rule (lens four-fifths of the time).
• Finish the sentence, glance, return — darting between words signals anxiety.
• Count lens-breaks muted: under 5 is strong, over 12 needs the dot drill daily.

SCRIPT TO STEAL
“Dot by the lens. Finish the thought, glance, return.”', 'Record 60 seconds with a dot by the lens. Watch muted, count lens-breaks. Target: under 8 this week, under 5 next.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 5, 'Gestures that support words', 'Hands should illustrate, not decorate. Three gestures cover 90% of speaking: the count (fingers for enumerated points — audiences track numbers visually), the container (hands shaping the size or scope of an idea), and the beat (small downward pulse on the key word). Everything else — fidgeting, pockets, face-touching — is noise.

Keep gestures in the frame box: between waist and shoulders, out from the body. Below-frame hands vanish; above-shoulder flailing distracts. Stillness between gestures matters as much — return hands to rest so each gesture means something.

Record your three-beat achievement story using only count-container-beat gestures. Watch muted: if the hands match the words, the talk feels twice as confident with zero content change.

EXAMPLE
The count (fingers for enumerated points), the container (hands shaping the idea’s size), the beat (a small pulse on the key word) — three gestures cover ninety percent of speaking. Muted playback shows hands matching words: the talk feels twice as confident with zero content change.

COMMON MISTAKES
• Hands in pockets or on your face — noise; keep them in the frame box (waist to shoulders).
• Above-shoulder flailing — distracts; gestures move out from the body, not up.
• Decorating instead of illustrating — every gesture must match a word; stillness between gestures makes each one mean something.

KEY TAKEAWAYS
• Count, container, beat — three gestures cover 90% of speaking.
• Frame box: between waist and shoulders, out from the body.
• Stillness between gestures matters as much as the gestures themselves.

SCRIPT TO STEAL
“Count on fingers. Shape the idea. Beat the key word. Then rest.”', 'Record your achievement story using only the 3 gestures (count, container, beat). Watch muted — hands must match words.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 6, 'Posture and energy', 'Energy reads through the body before a word lands. Feet planted, weight even, shoulders back and down, chin level with the lens — this base posture raises vocal projection and cuts fidgeting at the source, because a stable base gives nervous energy nowhere to leak.

Match energy to message plus ten percent. Flat delivery of exciting news confuses audiences; oversized energy on serious news alarms them. Record the same 30 seconds twice — once flat, once at 110% — and find your honest middle.

The two-minute reset before any recording: shake out hands, roll shoulders, three slow breaths, one power posture hold. Athletes warm up; speakers should too. Your day-1 tape versus a warmed-up tape will convince you faster than any argument.

EXAMPLE
Planted feet, shoulders back and down, chin level with the lens — then the same thirty seconds recorded twice: once flat, once at 110%. The honest middle (message plus ten percent) is where energy reads as engaged without alarming anyone.

COMMON MISTAKES
• Swaying or pacing — a stable base gives nervous energy nowhere to leak; plant feet and cut fidgeting at the source.
• Energy mismatch — flat on exciting news confuses; oversized on serious news alarms.
• No pre-record reset — shake, roll shoulders, three breaths, one posture hold; five minutes of ritual buys a full grade.

KEY TAKEAWAYS
• Base posture: feet planted, weight even, shoulders back and down, chin level.
• Match energy to the message plus ten percent.
• The 2-minute reset is a ritual — rituals kill jitters by giving nerves a job.

SCRIPT TO STEAL
“Shake, roll, breathe, hold. Flat vs 110% — find the middle.”', 'Do the 2-minute reset (shake, roll, breathe, posture hold), then record the same update twice: flat vs 110%. Keep the middle.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 7, 'The 3-minute voice warmup', 'Cold voices crack, thin out, and tire. A three-minute routine fixes it: one minute of lip trills sliding pitch up and down (engages breath support without strain), one minute of humming scales (warms resonance), one minute of tongue-twisters accelerating (''red lorry, yellow lorry'' faster each round — articulation for consonants that mush under pressure).

Hydrate before, not during: room-temperature water 15 minutes prior beats mid-talk sips that signal nerves. Avoid dairy and excess caffeine right before — both thicken or dry the voice.

Make it a pre-record ritual alongside the posture reset. Five minutes of preparation reliably buys a full grade of perceived confidence, and rituals kill pre-camera jitters by giving nerves a job.

EXAMPLE
One minute of lip trills sliding pitch up and down, one of humming scales, one of tongue-twisters accelerating — then the immediately-recorded take sounds a full grade clearer than a cold take. Five minutes of ritual reliably buys perceived confidence.

COMMON MISTAKES
• Recording cold — cold voices crack, thin out, and tire; warm up trills, hums, twisters first.
• Mid-talk sips — hydrate with room-temperature water fifteen minutes prior; sips mid-talk signal nerves.
• Dairy or excess caffeine right before — both thicken or dry the voice.

KEY TAKEAWAYS
• The 3-minute routine: 1 min trills, 1 min hums, 1 min twisters faster each round.
• Room-temperature water 15 minutes before beats mid-talk sips.
• Rituals kill pre-camera jitters by giving nerves a job.

SCRIPT TO STEAL
“1 min trills. 1 min hums. 1 min twisters. Then record.”', 'Run the full 3-minute warmup (trills, hums, twisters), then immediately record 2 minutes. Compare vocal clarity to a cold take.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='voice-body-masterclass'), 8, 'Putting it together: the 2-minute talk', 'Final exam for this track: a 2-minute talk deploying everything — pause discipline, 130-160 pace, three emphasis marks, lens contact, count-container-beat gestures, base posture. Pick a topic with stakes: why you deserve a raise, why your team should adopt your idea.

Structure it tight: 15-second claim, three 30-second points with one proof each, 15-second close echoing the claim. Constraints force craft — two minutes with a skeleton beats five minutes wandering.

Triple-scan the result and log all three scores beside your day-1 numbers from this same exercise. If you skipped day 1, record it now: the before-tape is the most motivating asset in this entire program.

EXAMPLE
The 2-minute talk with everything deployed — pause discipline, 130–160 pace, three emphasis marks, lens contact, count-container-beat gestures, base posture. Triple-scanned and logged beside day 1 of this same exercise: the before/after pair proves the entire course in two tapes.

COMMON MISTAKES
• Five minutes wandering — two minutes with a skeleton beats five without; constraints force craft.
• Skipping the before-tape — record day 1 of this same exercise; the gap is the proof and the fuel.
• Treating this as a drill — this is the exam; drills were one skill at a time, this is all of them.

KEY TAKEAWAYS
• Structure tight: 15s claim, three 30s points with one proof each, 15s close echoing the claim.
• Full checklist: pauses, pace, emphasis, lens, gestures, posture — all six deployed.
• Triple-scan and log all three scores beside day 1.

SCRIPT TO STEAL
“Claim: 15s. Three points, one proof each. Close echoes claim. Scan and log.”', 'Record the 2-minute talk with full technique + skeleton structure. Triple-scan it. Log audio, video, transcript scores.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Interview OS', 'interview-os', 'career', 6, '6 lessons • FAANG answers', false, 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&auto=format&fit=crop&q=60', NULL, 'FAANG-style STAR answers, salary negotiation, whiteboard communication.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 1, 'The 5 stories every candidate needs', 'Walk into any interview with five banked stories and you can answer 80% of behavioral questions by mapping, not inventing: a hard problem solved, a conflict navigated, a failure and lesson, a time you led without authority, and a proud shipped result. Preparation beats improvisation because stress destroys recall — banked stories survive it.

Write each in three beats with one number. Keep them in a one-page doc you review the morning of. When a surprise question lands, pause, pick the closest story, and bridge: ''That reminds me of when…'' — interviewers reward relevance, not literal matching.

Gaps in your bank are your prep list. Missing a leadership story? That is this week''s recording topic, twice.

EXAMPLE
A hard problem solved, a conflict navigated, a failure and lesson, leading without authority, a proud shipped result — five banked stories map to eighty percent of behavioral questions. Under stress recall dies; banked stories survive it. That is why preparation beats improvisation.

COMMON MISTAKES
• Inventing under pressure — stress destroys recall; mapped banked stories do not.
• No numbers — each story gets one number; a story with one is evidence.
• Preparing thirty questions — ten cover the deck; depth beats breadth every time.

KEY TAKEAWAYS
• Five stories: hard problem, conflict, failure, led, shipped.
• Three beats + one number each; keep them in a one-page doc you review the morning of.
• Gaps in the bank are the prep list — record the weakest as a 90s STAR.

SCRIPT TO STEAL
“Hard problem / conflict / failure / led / shipped. Each: 3 beats + 1 number.”', 'Write your 5 stories in 3 beats each with one number per story. Identify the weakest — record it as a 90-second STAR.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 2, '''Tell me about yourself'' in 2 minutes', 'Present, past, future in 120 seconds: who you are now (one line with your spike), the two moves that explain your trajectory, and why this role is the obvious next step. Cut everything else — graduation years, full history, hobbies — unless it serves the hire.

Tailor the future line per company using one researched fact: their market, their tech, their problem. ''...which is why your infra scale-up is exactly where I add most'' beats any generic closer and proves you prepared.

Polish until it sounds unpolished. Five recorded takes, keep the one with a single genuine smile. This opener sets the interviewer''s priors — everything after gets filtered through it.

EXAMPLE
‘Now I ship payment systems at scale. Before that I taught math — where I learned to explain complexity. That’s why your infra scale-up is exactly where I add most.’ Present, past, future — and the company-specific future line proves you prepared when nobody else did.

COMMON MISTAKES
• Resume recital — graduation years, full history, hobbies; cut unless it serves the hire.
• Generic closer — one researched fact per company; the future line is where preparation shows.
• Unpolished opener — five recorded takes; it must be the most polished two minutes you own, delivered as if just thought of.

KEY TAKEAWAYS
• Present (your spike) → past (2–3 moves) → future (why this role), in 120 seconds.
• Tailor the future line per company with one researched fact.
• The opener sets the interviewer’s priors — everything after is filtered through it.

SCRIPT TO STEAL
“Now I ___. Before: ___. That’s why your ___ is exactly where I add most.”', 'Write + record your 2-minute opener 3 times. Each take must end on a company-specific future line.', NULL, 15, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 3, 'Behavioral question bank', 'Behavioral rounds draw from a small deck: conflict, failure, ambiguity, tight deadline, disagreement with a manager, mentoring someone, influencing without authority, and handling a mistake in production. Ten questions cover the space — prepare all ten, not thirty.

For each, fix the 90-second STAR with 15-10-40-25 proportions and a learned line at the end. The learned line (''since then I always…'') is what separates seniors: it shows the failure compounded into judgment.

Drill under pressure: have the app''s random topic picker surprise you, or set a 30-second prep timer. Calm recall under a timer is the actual interview skill — content without it collapses.

EXAMPLE
Conflict, failure, ambiguity, deadline, disagreement with a manager, mentoring, influence without authority, a production mistake — ten questions cover the behavioral deck. The learned line (‘since then I always…’) is what separates seniors: failure compounded into judgment.

COMMON MISTAKES
• Thirty questions half-prepared — ten fully prepared beats thirty thinly covered.
• No learned line — end every STAR with the mechanism; that is the seniority signal.
• No pressure practice — 30-second prep timers build calm recall, the actual interview skill.

KEY TAKEAWAYS
• Ten questions cover the space — prepare all ten, not thirty.
• 15-10-40-25 proportions + a learned line at the end of each answer.
• Drill under a timer: content without calm recall collapses.

SCRIPT TO STEAL
“Since then I always ___. + 30s prep, 90s answer.”', 'Pick 3 bank questions at random with a 30s prep timer. Answer each in 90s STAR. Log which felt shakiest.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 4, 'Whiteboard communication', 'Interviewers score thinking aloud as heavily as correctness. Narrate structure before detail: ''I''ll clarify constraints, sketch two approaches, then go deep on one.'' Silence while you think reads as stuck; narrated thinking reads as rigorous — same brain, different signal.

Verbalize trade-offs explicitly: ''This is O(n) time for O(1) space; given our read-heavy load I''d take it.'' Trade-off sentences are seniority signals — juniors describe solutions, seniors compare them.

When stuck, say so with a plan: ''I''m blocked on the edge case; let me test with a small example.'' Stuck-with-a-plan beats silent spinning every time. Record a 10-minute mock and count your silent gaps over 5 seconds — drive them to zero.

EXAMPLE
‘I’ll clarify constraints, sketch two approaches, then go deep on one. This is O(n) time for O(1) space — given our read-heavy load, I’d take it.’ Narrated structure, explicit trade-offs — interviewers score thinking aloud as heavily as correctness, and seniors compare while juniors describe.

COMMON MISTAKES
• Silent thinking — reads as stuck; narrated thinking reads as rigorous. Same brain, different signal.
• Describing without comparing — trade-off sentences (‘X for Y given Z’) are the seniority signal.
• Stuck without a plan — ‘I’m blocked; let me test a small example’ beats silent spinning every time.

KEY TAKEAWAYS
• Narrate structure before detail: clarify → sketch → go deep.
• Verbalize trade-offs explicitly — every approach gets a comparison sentence.
• Zero silent gaps over 5 seconds — record a mock and count them.

SCRIPT TO STEAL
“I’ll clarify constraints, sketch two approaches, go deep on one. This is O(n) for O(1) — given our load, I’d take it.”', 'Record 10 minutes solving any problem aloud. Rules: narrate structure first, zero silent gaps over 5s, state one trade-off.', NULL, 15, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 5, 'Questions to ask them', '''Do you have questions for us?'' is scored, and ''no'' is a fail. Prepare five, ask two or three: the team''s biggest current challenge, what success looks like at 6 months, why the interviewer stays, how decisions get made, what would make someone fail in this role. Each signals you evaluate them — high-status candidates choose, they don''t beg.

Never ask anything the website answers, anything about perks first, or anything that reveals zero preparation. One compensation question is fine late-stage, framed as scope: ''What is the range budgeted for this level?''

Write your five now, tailored with one researched fact each. Asking a sharp question about their actual roadmap beats any answer you gave all day.

EXAMPLE
‘What’s the team’s biggest challenge right now?’ and ‘Why do you stay?’ — two questions that signal you evaluate them, not beg them. High-status candidates choose. Each prepared question carries one researched fact, and one sharp question outweighs any answer you gave all day.

COMMON MISTAKES
• ‘No questions’ — an automatic fail on the scored portion of the interview.
• Website-answerable questions — they signal zero preparation.
• Perks first — one compensation question late-stage, framed as scope, is fine; perks-first is not.

KEY TAKEAWAYS
• Prepare five, ask two or three: challenge, success at 6 months, why they stay, decision-making, failure modes.
• Each question signals you evaluate them — that is the status signal.
• One researched fact per question beats any answer you gave all day.

SCRIPT TO STEAL
“What’s the team’s biggest challenge right now? Why do YOU stay?”', 'Write 5 tailored questions with one researched fact each. Ask 2 aloud to camera as if the interviewer is present.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='interview-os'), 6, 'Salary negotiation + closing', 'Never anchor first, never accept on the call. When pressed: enthusiastic + range + data + silence. ''I''m excited about this role — based on market data and scope, I''m looking at 18 to 21. Can we make that work?'' Then say nothing. The silence does the negotiating.

Expand the pie beyond base: joining bonus, review timeline (''revisit comp in 6 months in writing''), equity, remote flexibility. A 6-month review clause often beats a small base bump — and get every promise in the offer letter, never verbal.

Close every process with a 24-hour thank-you note referencing one specific discussion point. It is cheap, rare, and occasionally flips a maybe. Then stop touching the process and let the silence work for you too.

EXAMPLE
‘18 to 21. Can we make that work?’ — silence. Then: ‘Can we revisit comp in 6 months, in writing?’ A written review clause often beats a small base bump. And a 24-hour thank-you note referencing one specific discussion point occasionally flips a maybe.

COMMON MISTAKES
• Anchoring first — let them; respond with range + data + silence.
• Verbal promises — get every clause in the offer letter, never verbal.
• No thank-you note — it is cheap, rare, and occasionally decisive; send within 24 hours.

KEY TAKEAWAYS
• Range + one pie-expander + silence — the silence does the negotiating.
• Expand: joining bonus, 6-month written review, equity, remote flexibility.
• Close with a 24-hour thank-you note referencing one specific point.

SCRIPT TO STEAL
“__ to __. Can we make that work? [silence] + Can we revisit comp in 6 months, in writing?”', 'Script your range + one pie-expander + silence. Record the delivery. Then draft your thank-you template with a blank for the specific point.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Network Without Fear', 'network-without-fear', 'social', 5, '5 lessons • Small talk system', true, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=60', NULL, 'Small talk, networking, and dating conversations — a system for social confidence.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 1, 'Small talk is a skill, not talent', 'Nobody is born good at small talk — extroverts just got more reps. Treat it as a trained skill with drills, and the anxiety story (''I''m just not a people person'') dissolves within weeks of deliberate practice.

The reframe that unlocks everything: your job is not to be interesting, it is to be interested. People rate conversations by how heard they felt, not by your stories. Curiosity is a learnable technique, not a personality trait.

Start with low stakes: one 30-second exchange daily — a barista, a colleague, a stranger in a lift. Reps at zero stakes build the muscle that high-stakes rooms require. Log each rep with one observed detail about the other person.

EXAMPLE
Two colleagues, same networking event. One has treated small talk as a trained skill — thirty seconds of daily reps for a month — and works the room with ease. The other ‘isn’t a people person.’ The difference is reps, not talent — and reps are available to anyone.

COMMON MISTAKES
• Waiting to talk instead of listening — conversations die in the wait, not the words.
• The ‘not a people person’ story — it is untrained skill, not personality; reps dissolve it within weeks.
• High-stakes first — low stakes (a barista, a colleague, a lift) build the muscle that high-stakes rooms require.

KEY TAKEAWAYS
• Your job is to be interested, not interesting — people rate conversations by how heard they felt.
• One 30-second exchange daily; log one observed detail about the other person.
• Curiosity is a technique, not a trait.

SCRIPT TO STEAL
“One 30-second exchange today. Log one detail about them.”', 'Have one 30-second low-stakes exchange today. Log what you learned about them in one line.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 2, 'Openers that actually work', 'Forget clever lines — the best openers are situational, specific, and easy to answer. ''What did you think of the keynote''s second half?'' beats ''So what do you do?'' because it shares context and invites opinion, not biography. Observation plus open question: comment on something true in the room, then ask.

Prepare five situational openers before any event: about the venue, the speaker, the food, the crowd, the theme. Walking in armed removes the hardest five seconds — the approach.

Body language opens before words do. Uncross arms, hold your drink low (high drinks create barriers), and smile before speaking — the smile must precede the sentence or it reads as nervous, not warm.

EXAMPLE
‘What did you think of the keynote’s second half?’ — shares context, invites opinion, lives. ‘So what do you do?’ — invites biography, dies. The best openers are situational, specific, and easy to answer — never clever.

COMMON MISTAKES
• ‘What do you do?’ — biography questions die; situational + specific openers live.
• Clever lines — the best openers are easy to answer, not clever; clever creates pressure.
• No smile first — the smile must precede the sentence or it reads as nervous, not warm.

KEY TAKEAWAYS
• Observation + open question: comment on something true in the room, then ask.
• Prepare five situational openers before any event: venue, speaker, food, crowd, theme.
• Body opens before words: uncross arms, hold your drink low, smile before speaking.

SCRIPT TO STEAL
“What did you think of ___’s second half?”', 'Write 5 situational openers for your next event or weekday. Practice approach + smile-first delivery to camera twice.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 3, 'Listen, then ladder', 'Conversations die when people wait-to-talk instead of listening. The ladder technique: take one word from their answer and climb — ''You mentioned Goa — surf or shacks?'' Each rung proves you heard them, and heard people open up, which makes YOU the great conversationalist without performing.

Ask twice before telling once. Two follow-up questions per statement is the ratio — the second question (''and what was the hardest part of that?'') is where real conversation starts; the first only warms up.

Paraphrase to confirm: ''So the launch slipped but the team stayed — that must have been intense.'' Feeling understood is the drug of good conversation. Deal it deliberately.

EXAMPLE
‘You mentioned Goa — surf or shacks?’ Each rung proves you heard them; heard people open up. The second question — ‘and what was the hardest part of that?’ — is where real conversation starts. You become the great conversationalist without performing.

COMMON MISTAKES
• One question only — ask twice before telling once; the second question opens them up.
• No paraphrase — ‘So the launch slipped but the team stayed — intense.’ Feeling understood is the drug of good conversation.
• Waiting to talk — take one word from their answer and climb; the ladder proves you listened.

KEY TAKEAWAYS
• Ladder: take one word from their answer and climb — each rung proves you listened.
• Ratio: two follow-up questions per statement of your own.
• Paraphrase to confirm — deal feeling-understood deliberately.

SCRIPT TO STEAL
“You mentioned ___ — ___? And what was the hardest part of that?”', 'In your next conversation, ask 2 follow-ups per answer and paraphrase once. Note which follow-up opened them up most.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 4, 'Exiting gracefully + follow-up', 'Beginners trap themselves in dying conversations because leaving feels rude. It isn''t — staying past expiry is what feels bad, for both sides. The graceful exit: appreciation + reason + future (''Great chatting — I''m going to grab food, let''s connect on LinkedIn?''). Future-oriented exits preserve warmth.

The follow-up within 24 hours is where networking actually happens — 90% of event value is post-event. One specific line beats generic flattery: ''Loved your point on pricing — trying it Monday.'' Specificity proves attention.

Collect contacts with intent: after each event, message your top three within a day. Networks are built in follow-ups, not handshakes.

EXAMPLE
‘Great chatting — I’m going to grab food, let’s connect on LinkedIn?’ — then, within 24 hours: ‘Loved your point on pricing — trying it Monday.’ The 24-hour specific line is where networking actually happens; ninety percent of event value is post-event.

COMMON MISTAKES
• Trapping yourself in dying conversations — staying past expiry feels bad for both sides; exit gracefully.
• Generic follow-up (‘great to meet you’) — one specific line beats generic flattery; specificity proves attention.
• Collecting without writing — message your top three within a day; networks are built in follow-ups, not handshakes.

KEY TAKEAWAYS
• Exit: appreciation + reason + future.
• Follow up within 24 hours with one specific line each.
• After each event: top three contacts, one day, one specific line.

SCRIPT TO STEAL
“Great chatting — grabbing food, let’s connect? / Loved your point on ___ — trying it Monday.”', 'Script your 3-part exit line. After your next social event, follow up with 2 people within 24h with one specific line each.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='network-without-fear'), 5, 'The 7-day social challenge', 'Knowledge without reps is trivia. Seven days: Day 1 — one low-stakes exchange. Day 2 — opener + 2-minute chat with a colleague. Day 3 — ladder technique in any conversation. Day 4 — compliment a stranger specifically. Day 5 — exit a conversation gracefully on purpose. Day 6 — follow up with someone within 24h. Day 7 — attend or start one group conversation.

Log each day in one line: what you did, what worked, one adjustment. The log matters more than perfection — it converts random courage into a training record your brain trusts.

After day 7, keep the two highest-leverage habits permanently: daily laddering and 24-hour follow-ups. Those two alone outperform 90% of networkers who collect contacts and never write.

EXAMPLE
Day 1: one exchange. Day 2: opener + two-minute chat. Day 3: ladder. Day 4: specific compliment. Day 5: graceful exit on purpose. Day 6: follow-up. Day 7: one group conversation — seven logged days convert random courage into a training record your brain trusts.

COMMON MISTAKES
• No log — the one-line daily log matters more than perfection; it converts courage into a record.
• Skipping day 2 — streaks die on day two; schedule all seven days now.
• Quitting after day 7 — keep laddering + 24-hour follow-ups permanently; those two outperform 90% of networkers.

KEY TAKEAWAYS
• Seven days: exchange, opener, ladder, compliment, exit, follow-up, group.
• One-line log each day: what you did, what worked, one adjustment.
• Keep the two highest-leverage habits forever: daily laddering + 24-hour follow-ups.

SCRIPT TO STEAL
“Day 1: one exchange. All 7 days scheduled now.”', 'Start Day 1 today: one 30-second exchange + one-line log. Schedule all 7 days on your calendar now.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Course" ("id","title","slug","track","lessons","duration","free","image","videoUrl","description","isActive","createdAt","updatedAt")
VALUES (gen_random_uuid()::text, 'Creator Voice Lab', 'creator-voice-lab', 'creator', 7, '7 lessons • Hook + retention', false, 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=600&auto=format&fit=crop&q=60', NULL, 'Reels, podcasts, pitching — hooks, retention, and CTAs that convert.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET "title"=EXCLUDED."title", "track"=EXCLUDED."track", "lessons"=EXCLUDED."lessons", "duration"=EXCLUDED."duration", "free"=EXCLUDED."free", "image"=EXCLUDED."image", "videoUrl"=EXCLUDED."videoUrl", "description"=EXCLUDED."description", "isActive"=true;

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 1, 'Hooks: the first 3 seconds', 'Viewers decide in three seconds, and the algorithm watches their decision. Open with payoff, not preamble: ''I doubled my salary with one sentence'' beats ''Hey guys, welcome back to my channel'' by orders of magnitude. Cut every intro — start mid-action, mid-claim, mid-story.

Four hook templates cover most content: the bold claim (''Everything you know about X is wrong''), the number (''3 mistakes killing your Y''), the story drop (''Last Tuesday my boss said…''), the question wound (''Still nervous in meetings?''). Rotate them; track which your audience rewards.

Record five hooks for one topic, 5 seconds each, and pick by gut. Hook-writing is a separate muscle from content — train it separately, ten hooks a week, and retention graphs bend within a month.

EXAMPLE
‘I doubled my salary with one sentence’ beats ‘Hey guys, welcome back to my channel’ by orders of magnitude — viewers decide in three seconds, and the algorithm watches their decision. Open with payoff, not preamble.

COMMON MISTAKES
• ‘Hey guys, welcome back’ — preamble kills the hook; start mid-action, mid-claim, mid-story.
• Same hook every video — four templates: bold claim, number, story drop, question wound; rotate and track which your audience rewards.
• One hook draft — record five, five seconds each, pick by gut; hooks are a separate muscle from content.

KEY TAKEAWAYS
• Viewers decide in 3 seconds — open with payoff, not preamble.
• Four templates cover most content — rotate them deliberately.
• Ten hooks a week is the training volume that bends retention graphs within a month.

SCRIPT TO STEAL
“Bold claim / number / story drop / question wound — 5 hooks, 5 seconds each.”', 'Write 5 hooks (one per template) for your next topic. Record each in 5 seconds. Keep the strongest two.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 2, 'Retention: open loops', 'Retention is curiosity management. An open loop — a promised payoff delivered later (''…and the third mistake cost me a promotion — coming up'') — keeps viewers through the middle where most drop off. Plant one loop in the first 15 seconds and close it near the end.

Cut dead air ruthlessly. Every second that doesn''t earn the next must go: silences over a beat, repeated words, throat-clearing, ''so yeah''. Edit at 1.2x attention — if you get bored watching, they left minutes ago.

Structure for retention: hook, quick roadmap (''three things''), point-proof-point-proof, loop payoff, CTA. Predictability of shape with surprise of content — that combination holds humans.

EXAMPLE
‘…and the third mistake cost me a promotion — coming up.’ One open loop in the first fifteen seconds holds viewers through the middle where most drop off — close it near the end. Retention is curiosity management, not luck.

COMMON MISTAKES
• Loop promised but never paid — close it near the end or viewers learn not to trust you.
• Dead air — every second that does not earn the next must go; edit at 1.2x attention.
• Boring edits — if you get bored watching your own cut, they left minutes ago.

KEY TAKEAWAYS
• Retention is curiosity management — plant one loop in the first 15s, close near the end.
• Cut non-earning seconds ruthlessly: silences over a beat, repeated words, throat-clearing.
• Structure: hook, roadmap, point-proof-point-proof, loop payoff, CTA.

SCRIPT TO STEAL
“…and the third mistake cost me a promotion — coming up.”', 'Take one recorded video. Mark every second that doesn''t earn the next. Cut or re-record those segments. Compare lengths.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 3, 'One idea per video', 'Beginner creators cram five ideas into one video and retain none. One video, one idea, one takeaway the viewer can repeat: ''pause before answering''. If your video needs ''and also'', split it — two focused videos outperform one packed one, and you just doubled your content calendar.

Test every script with the repeat-back: could a viewer state your point in one sentence? If not, cut until they can. Clarity is retention; confusion is the swipe.

Depth beats breadth within the one idea: one claim, one story, one proof, one drill. The LINGAUX triple-scan maps perfectly — structure the transcript before you shoot, not after.

EXAMPLE
One video, one idea, one takeaway the viewer can repeat: ‘pause before answering.’ If the script needs ‘and also’, split it — two focused videos outperform one packed one, and you just doubled your content calendar.

COMMON MISTAKES
• Five ideas in one video — cramming retains none; one video, one idea.
• ‘And also’ — split on it; two focused videos beat one packed every time.
• No repeat-back test — could a viewer state your point in one sentence? If not, cut until they can.

KEY TAKEAWAYS
• One takeaway the viewer can repeat — clarity is retention, confusion is the swipe.
• Depth beats breadth within the one idea: one claim, one story, one proof, one drill.
• Structure the transcript before you shoot, not after.

SCRIPT TO STEAL
“Could a viewer state my point in one sentence? If not, cut.”', 'Take your next topic. Write its one-sentence takeaway first, then allow only content serving it. Cut the rest into future videos.', NULL, 10, true)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 4, 'CTA without cringe', 'Begging (''smash that button!'') repels; earning converts. The CTA formula: value reminder + single action + reason (''If this pause drill helped, follow for one drill daily — tomorrow is pace''). One action only — follow OR comment OR share; three asks get zero.

Place CTAs at value peaks, not endings. Mid-video after a strong insight converts multiples of end-screen begging, because motivation is highest right after receiving value. Endings get one soft line, maximum.

Match CTA to platform: comments for discussion topics (''what is YOUR filler word?''), follows for series (''day 4 of 30 tomorrow''), shares for identity content people send to friends. Right ask, right place.

EXAMPLE
‘If this pause drill helped, follow for one drill daily — tomorrow is pace.’ Value reminder, single action, reason — placed at a value peak mid-video, it converts multiples of end-screen begging. Motivation is highest right after receiving value.

COMMON MISTAKES
• Begging (‘smash that button!’) — repels; earn the action with a value reminder and a reason.
• Three asks at once — follow OR comment OR share; three asks get zero.
• Endings only — mid-video after a strong insight converts multiples of end screens.

KEY TAKEAWAYS
• Formula: value reminder + single action + reason.
• Place CTAs at value peaks, not endings — motivation is highest right after value.
• Match ask to platform: comments for discussion, follows for series, shares for identity.

SCRIPT TO STEAL
“If this drill helped, follow for one drill daily — tomorrow is ___.”', 'Write 3 CTAs (comment / follow / share versions) for your next video. Place the strongest mid-video at a value peak.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 5, 'Batching: 5 videos in 1 hour', 'Daily posting dies on daily production. Batching — one hour, five videos — separates creation from performance and multiplies output. Setup once: same light, same frame, same shirt. Then shoot back-to-back with a 2-minute reset between: hooks first for all five, then bodies, then CTAs.

Scripts fit index cards: hook line, three beats, CTA. Full scripts invite reading-eyes; cards invite talking. If you stumble twice on a card, simplify the card, not yourself.

Schedule the batch weekly — same hour, non-negotiable. Consistency is a calendar event, not motivation. Five weekly batches is a 100-video catalog in five months, the actual asset that compounds.

EXAMPLE
One hour, five videos, setup once: same light, same frame, same shirt. Hooks first for all five, then bodies, then CTAs, with a two-minute reset between — five weekly batches is a 100-video catalog in five months. That catalog is the asset that compounds.

COMMON MISTAKES
• Daily production — daily posting dies on daily production; batch weekly, same hour, non-negotiable.
• Full scripts — reading-eyes; index cards (hook line, three beats, CTA) invite talking.
• No reset between takes — a 2-minute reset keeps energy honest; simplify the card, not yourself.

KEY TAKEAWAYS
• One hour = five videos; setup once, shoot back-to-back.
• Index cards, not full scripts — cards invite talking, scripts invite reading.
• Five weekly batches is a 100-video catalog in five months.

SCRIPT TO STEAL
“Hooks first for all five, then bodies, then CTAs. 2-min reset between.”', 'This week: one 60-minute batch session. 5 index-card scripts, shoot all five. Log time per video.', NULL, 15, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 6, 'Reading comments like data', 'Comments are free market research wearing casual clothes. Sort weekly: questions asked twice become your next videos, objections become content gaps to address, praise patterns reveal your spike (double down there), and trolls get deleted without ceremony — engagement with abuse trains the algorithm wrong.

Reply to early comments within the hour: the algorithm counts velocity, and a creator who answers builds the community that retains. Pin the best question-comment — it seeds ten more.

Track one metric per month, not ten: 90-day follower growth, or average watch time, or saves per video. One north star beats a dashboard of noise.

EXAMPLE
A question asked twice in your comments becomes your next video; a praise pattern reveals your spike to double down on. Comments are free market research wearing casual clothes — most creators scroll them instead of sorting them.

COMMON MISTAKES
• Engaging trolls — delete without ceremony; engagement with abuse trains the algorithm wrong.
• Ignoring repeated questions — questions asked twice are your next videos, free; objections are content gaps.
• Ten metrics — one north star per month (90-day growth, watch time, or saves) beats a dashboard of noise.

KEY TAKEAWAYS
• Sort weekly: repeated questions (video ideas), objections (gaps), praise patterns (your spike).
• Reply to early comments within the hour — the algorithm counts velocity.
• Pin the best question-comment — it seeds ten more.

SCRIPT TO STEAL
“Sort weekly: repeated questions, objections, praise patterns. Pin the best.”', 'Audit your last 10 comments: list repeated questions (video ideas), objections (gaps), praise (your spike). Reply to 3 today.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

INSERT INTO "Lesson" ("id","courseId","order","title","body","drill","videoUrl","minutes","free")
VALUES (gen_random_uuid()::text, (SELECT "id" FROM "Course" WHERE "slug"='creator-voice-lab'), 7, 'Your 30-day posting calendar', 'Final build: a 30-day calendar mixing proven formats — 40% teaching (one idea + drill), 30% story (your journey, failures included), 20% trends (your take within 48 hours), 10% community (Q&A, duets, replies). Ratio prevents both boredom and burnout.

Batch weekly, post at your audience''s peak hour (check analytics, default to 7-9pm IST for India), and review retention graphs every Sunday: where do viewers leave? That timestamp is your curriculum — fix exits first, polish intros second.

Day 30 deliverable: 20+ posted videos, one retention graph you understand, and three proven hooks to reuse. That is a creator foundation most people take a year to build.

EXAMPLE
Forty percent teaching, thirty story, twenty trends, ten community — the ratio prevents both boredom and burnout. Sunday review of retention graphs: the timestamp where viewers leave is your curriculum — fix exits first, polish intros second.

COMMON MISTAKES
• Random posting — the 40/30/20/10 mix keeps the calendar full and the creator sane.
• No peak-hour check — post at your audience’s peak (check analytics; default 7–9pm IST for India).
• Ignoring exits — the retention graph’s drop timestamp is your curriculum; fix exits first, polish second.

KEY TAKEAWAYS
• 40% teaching, 30% story, 20% trends, 10% community.
• Batch weekly, post at peak hour, review retention every Sunday.
• Day 30 deliverable: 20+ videos, one understood graph, three proven hooks to reuse.

SCRIPT TO STEAL
“12 teaching, 9 story, 6 trend, 3 community. Sunday: where do viewers leave?”', 'Draft your 30-day calendar: 12 teaching, 9 story, 6 trend, 3 community slots with topics. Schedule batch hours.', NULL, 10, false)
ON CONFLICT ("courseId", "order") DO UPDATE SET "title"=EXCLUDED."title", "body"=EXCLUDED."body", "drill"=EXCLUDED."drill", "videoUrl"=EXCLUDED."videoUrl", "minutes"=EXCLUDED."minutes", "free"=EXCLUDED."free";

-- Verify:
-- SELECT c.slug, count(l.id) AS lessons FROM "Course" c LEFT JOIN "Lesson" l ON l."courseId" = c.id GROUP BY c.slug ORDER BY c.slug;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const {
  User,
  Vocabulary,
  GrammarRule,
  ListeningExercise,
  WritingExercise,
  Test,
  Question,
  UserTestResult,
  Lesson,
  ChatSession,
  ChatMessage
} = require('./models');

const seedData = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Vocabulary.deleteMany({});
    await GrammarRule.deleteMany({});
    await ListeningExercise.deleteMany({});
    await WritingExercise.deleteMany({});
    await Test.deleteMany({});
    await Question.deleteMany({});
    await UserTestResult.deleteMany({});
    await ChatSession.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('🗑️ Deleted all old data');

    // 1. Tạo users
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      level: 'C1'
    });

    const user1 = await User.create({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'john123',
      level: 'A2'
    });

    const user2 = await User.create({
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'jane123',
      level: 'B1'
    });

    console.log('✅ Created users');

    // 2. Tạo vocabularies
    const vocabularies = await Vocabulary.create([
      { word: 'Experience', meaning: 'Kinh nghiệm, trải nghiệm', category: 'Du lịch', example: 'I had a wonderful experience traveling to Japan.' },
      { word: 'Destination', meaning: 'Điểm đến', category: 'Du lịch', example: 'Bali is a popular tourist destination.' },
      { word: 'Accommodation', meaning: 'Chỗ ở', category: 'Du lịch', example: 'We need to book accommodation in advance.' },
      { word: 'Software', meaning: 'Phần mềm', category: 'Công nghệ', example: 'This software helps you edit photos.' },
      { word: 'Database', meaning: 'Cơ sở dữ liệu', category: 'Công nghệ', example: 'The data is stored in a database.' },
      { word: 'Algorithm', meaning: 'Thuật toán', category: 'Công nghệ', example: 'The algorithm sorts the list efficiently.' },
      { word: 'Nutrition', meaning: 'Dinh dưỡng', category: 'Sức khỏe', example: 'Good nutrition is important for health.' },
      { word: 'Exercise', meaning: 'Bài tập, tập thể dục', category: 'Sức khỏe', example: 'Regular exercise keeps you fit.' },
      { word: 'Delicious', meaning: 'Ngon', category: 'Ẩm thực', example: 'This pizza is delicious!' },
      { word: 'Recipe', meaning: 'Công thức nấu ăn', category: 'Ẩm thực', example: 'Follow the recipe to make the cake.' },
    ]);
    console.log(`✅ Created ${vocabularies.length} vocabularies`);

    // 3. Tạo grammar rules
    const grammarRules = await GrammarRule.create([
      {
        rule_name: 'Thì hiện tại đơn', category: 'tenses', explanation: 'Cách dùng, công thức và bài tập thì hiện tại đơn trong tiếng Anh', example: 'I eat breakfast at 7 AM every day.',
        level: 'beginner', difficulty: 'easy', structure: 'S + V(s/es) + O',
        usage: ['Diễn tả thói quen hàng ngày', 'Diễn tả sự thật hiển nhiên', 'Diễn tả lịch trình, thời gian biểu'],
        content: {
          sections: [
            { type: 'definition', title: 'Định nghĩa', icon: '📘', text: 'Thì hiện tại đơn (<em>Present Simple Tense</em>) là thì dùng để diễn tả <strong>hành động lặp đi lặp lại</strong>, <strong>thói quen</strong>, <strong>sự thật hiển nhiên</strong> hoặc <strong>lịch trình cố định</strong>.' },
            { type: 'examples', title: 'Ví dụ trong câu', items: [
              { text: 'I <strong>wake up</strong> at 6 AM every day.', correct: true },
              { text: '<strong>The sun rises</strong> in the east.', correct: true },
              { text: '<strong>She works</strong> at a bank.', correct: true },
            ]},
            { type: 'structure', title: 'Cấu trúc', structure: 'S + V(s/es) + O', notes: 'Với chủ ngữ ngôi thứ ba số ít (he/she/it), động từ thêm <em>-s</em> hoặc <em>-es</em>.' },
            { type: 'rules', title: 'Quy tắc quan trọng', items: [
              { num: 1, text: 'Dùng <em>V(s/es)</em> khi chủ ngữ là ngôi thứ ba số ít (he, she, it).' },
              { num: 2, text: 'Thêm <em>-es</em> cho động từ kết thúc bằng <em>-ch, -sh, -s, -x, -o</em>.' },
              { num: 3, text: 'Với động từ kết thúc bằng <em>-y</em> đứng trước phụ âm, đổi <em>-y</em> thành <em>-i</em> rồi thêm <em>-es</em> (VD: study → studies).' },
            ]},
            { type: 'errors', title: 'Lỗi thường gặp', items: [
              { text: 'He <wrong>go</wrong> to school → dùng <correct>goes</correct>' },
              { text: 'She <wrong>studys</wrong> English → dùng <correct>studies</correct>' },
              { text: 'They <wrong>goes</wrong> to work → dùng <correct>go</correct> (they = số nhiều)' },
            ]},
          ]
        }
      },
      {
        rule_name: 'Thì hiện tại tiếp diễn', category: 'tenses', explanation: 'Diễn đạt hành động đang xảy ra và kế hoạch tương lai gần', example: 'I am reading a book right now.',
        level: 'beginner', difficulty: 'easy', structure: 'S + am/is/are + V-ing + O',
        usage: ['Diễn tả hành động đang xảy ra tại thời điểm nói', 'Diễn tả kế hoạch tương lai gần', 'Diễn tả sự thay đổi hoặc xu hướng'],
        content: {
          sections: [
            { type: 'definition', title: 'Định nghĩa', icon: '📘', text: 'Thì hiện tại tiếp diễn (<em>Present Continuous Tense</em>) diễn tả <strong>hành động đang xảy ra ngay lúc nói</strong>, <strong>kế hoạch tương lai gần</strong> hoặc <strong>sự thay đổi</strong> đang diễn ra.' },
            { type: 'examples', title: 'Ví dụ trong câu', items: [
              { text: 'I <strong>am reading</strong> a book right now.', correct: true },
              { text: '<strong>She is working</strong> on a new project.', correct: true },
              { text: '<strong>They are building</strong> a new school.', correct: true },
            ]},
            { type: 'structure', title: 'Cấu trúc', structure: 'S + am/is/are + V-ing + O', notes: 'Dùng <em>am</em> với chủ ngữ I, <em>is</em> với he/she/it, <em>are</em> với you/we/they.' },
            { type: 'rules', title: 'Quy tắc quan trọng', items: [
              { num: 1, text: 'Với động từ kết thúc bằng <em>-e</em>, bỏ <em>-e</em> rồi thêm <em>-ing</em> (VD: make → making).' },
              { num: 2, text: 'Với động từ 1 vần kết thúc bằng <em>phụ âm + nguyên âm + phụ âm</em>, gấp đôi phụ âm cuối rồi thêm <em>-ing</em> (VD: run → running).' },
              { num: 3, text: 'Không dùng thì này với các động từ chỉ trạng thái như <em>know, believe, love, hate, want</em>.' },
            ]},
            { type: 'errors', title: 'Lỗi thường gặp', items: [
              { text: 'I <wrong>am know</wrong> the answer → dùng <correct>I know</correct>' },
              { text: 'She <wrong>is makeing</wrong> a cake → dùng <correct>is making</correct>' },
              { text: 'They <wrong>are go</wrong> to school now → dùng <correct>are going</correct>' },
            ]},
          ]
        }
      },
      {
        rule_name: 'Thì quá khứ đơn', category: 'tenses', explanation: 'Kể về sự kiện đã xảy ra và hoàn thành trong quá khứ', example: 'I visited Hanoi last year.',
        level: 'beginner', difficulty: 'easy', structure: 'S + V2/ed + O',
        usage: ['Diễn tả hành động đã xảy ra và kết thúc trong quá khứ', 'Diễn tả thói quen trong quá khứ', 'Kể lại câu chuyện, sự kiện đã qua'],
        content: {
          sections: [
            { type: 'definition', title: 'Định nghĩa', icon: '📘', text: 'Thì quá khứ đơn (<em>Past Simple Tense</em>) dùng để diễn tả <strong>hành động đã hoàn thành trong quá khứ</strong>, <strong>thói quen trong quá khứ</strong> hoặc <strong>kể lại sự kiện</strong> đã xảy ra.' },
            { type: 'examples', title: 'Ví dụ trong câu', items: [
              { text: 'I <strong>visited</strong> Hanoi last year.', correct: true },
              { text: '<strong>She went</strong> to the cinema yesterday.', correct: true },
              { text: '<strong>They lived</strong> in London for 5 years.', correct: true },
            ]},
            { type: 'structure', title: 'Cấu trúc', structure: 'S + V2/ed + O', notes: 'Với động từ bất quy tắc, dùng cột 2 trong bảng động từ bất quy tắc.' },
            { type: 'rules', title: 'Quy tắc quan trọng', items: [
              { num: 1, text: 'Thêm <em>-ed</em> vào sau động từ có quy tắc (VD: walk → walked).' },
              { num: 2, text: 'Với động từ kết thúc bằng <em>-e</em>, chỉ thêm <em>-d</em> (VD: love → loved).' },
              { num: 3, text: 'Dùng <em>did not</em> + V (nguyên thể) ở thể phủ định.' },
            ]},
            { type: 'errors', title: 'Lỗi thường gặp', items: [
              { text: 'She <wrong>go</wrong> to school yesterday → dùng <correct>went</correct>' },
              { text: 'I <wrong>did not went</wrong> → dùng <correct>did not go</correct>' },
              { text: 'They <wrong>studys</wrong> hard → dùng <correct>studied</correct>' },
            ]},
          ]
        }
      },
      {
        rule_name: 'Thì hiện tại hoàn thành', category: 'tenses', explanation: 'Diễn đạt hành động xảy ra trong quá khứ có liên quan đến hiện tại', example: 'I have lived here for 5 years.',
        level: 'intermediate', difficulty: 'medium', structure: 'S + have/has + V3/ed + O',
        usage: ['Diễn tả hành động bắt đầu trong quá khứ và còn tiếp diễn đến hiện tại', 'Diễn tả kinh nghiệm từng trải qua', 'Diễn tả hành động vừa mới xảy ra'],
        content: {
          sections: [
            { type: 'definition', title: 'Định nghĩa', icon: '📘', text: 'Thì hiện tại hoàn thành (<em>Present Perfect Tense</em>) diễn tả <strong>hành động bắt đầu trong quá khứ và còn kéo dài đến hiện tại</strong>, <strong>kinh nghiệm</strong> hoặc <strong>hành động vừa mới xảy ra</strong>.' },
            { type: 'examples', title: 'Ví dụ trong câu', items: [
              { text: 'I <strong>have lived</strong> here for 5 years.', correct: true },
              { text: '<strong>She has visited</strong> Japan three times.', correct: true },
              { text: '<strong>They have just finished</strong> their homework.', correct: true },
            ]},
            { type: 'structure', title: 'Cấu trúc', structure: 'S + have/has + V3/ed + O', notes: 'Dùng <em>has</em> với he/she/it, <em>have</em> với I/you/we/they.' },
            { type: 'rules', title: 'Quy tắc quan trọng', items: [
              { num: 1, text: 'Dùng <em>for</em> + khoảng thời gian (for 2 years, for a week).' },
              { num: 2, text: 'Dùng <em>since</em> + mốc thời gian (since 2020, since Monday).' },
              { num: 3, text: 'Dùng <em>ever, never, already, just, yet</em> trong câu ở thì này.' },
            ]},
            { type: 'errors', title: 'Lỗi thường gặp', items: [
              { text: 'I <wrong>have saw</wrong> that movie → dùng <correct>have seen</correct>' },
              { text: 'She <wrong>has go</wrong> to London → dùng <correct>has gone</correct>' },
              { text: 'They <wrong>have went</wrong> home → dùng <correct>have gone</correct>' },
            ]},
          ]
        }
      },
      {
        rule_name: 'Câu bị động', category: 'passive-voice', explanation: 'Cấu trúc câu bị động ở các thì và cách chuyển đổi câu chủ động', example: 'The cake was baked by my mother.',
        level: 'intermediate', difficulty: 'medium', structure: 'S + be + V3/ed + (by O)',
        usage: ['Khi chủ thể thực hiện hành vi không quan trọng hoặc không rõ', 'Nhấn mạnh vào bản thân hành động', 'Dùng trong văn phong trang trọng, học thuật'],
        content: {
          sections: [
            { type: 'definition', title: 'Định nghĩa', icon: '📘', text: 'Câu bị động (<em>Passive Voice</em>) là câu mà <strong>chủ ngữ chịu tác động của hành động</strong>, thay vì thực hiện hành động. Được dùng khi <strong>không rõ</strong> hoặc <strong>không cần nhắc đến</strong> người thực hiện.' },
            { type: 'examples', title: 'Ví dụ trong câu', items: [
              { text: '<strong>The cake was baked</strong> by my mother.', correct: true },
              { text: '<strong>English is spoken</strong> all over the world.', correct: true },
              { text: '<strong>The letter was sent</strong> yesterday.', correct: true },
            ]},
            { type: 'structure', title: 'Cấu trúc chung', structure: 'S + be + V3/ed + (by O)', notes: 'Động từ "be" chia theo thì của câu chủ động. "By O" có thể lược bỏ nếu không quan trọng.' },
            { type: 'rules', title: 'Quy tắc quan trọng', items: [
              { num: 1, text: 'Chuyển tân ngữ của câu chủ động thành chủ ngữ của câu bị động.' },
              { num: 2, text: 'Chia động từ "be" theo đúng thì của câu chủ động, động từ chính đưa về <em>V3/ed</em>.' },
              { num: 3, text: 'Thêm <em>by + O</em> (chủ ngữ cũ) ở cuối câu nếu cần.' },
            ]},
            { type: 'errors', title: 'Lỗi thường gặp', items: [
              { text: 'The window <wrong>was broke</wrong> → dùng <correct>was broken</correct>' },
              { text: 'The report <wrong>is wrote</wrong> by John → dùng <correct>is written</correct>' },
              { text: 'The cake <wrong>were baked</wrong> by her → dùng <correct>was baked</correct> (cake = số ít)' },
            ]},
          ]
        }
      },
    ]);
    console.log(`✅ Created ${grammarRules.length} grammar rules`);

    // 4. Tạo listening exercises
    const listeningExercises = await ListeningExercise.create([
      {
        title: 'Daily Routine',
        subtitle: 'Hội thoại cơ bản về thói quen hàng ngày',
        type: 'conversation',
        level: 'A1',
        duration: 30,
        audio_url: 'https://example.com/audio/daily_routine.mp3',
        transcript: 'I wake up at 6 AM, then I brush my teeth...',
        questions_json: [
          { id: 1, question: 'What time does the person wake up?', options: ['5 AM', '6 AM', '7 AM', '8 AM'], correct_answer: '6 AM' },
          { id: 2, question: 'What does the person do after waking up?', options: ['Eat breakfast', 'Brush teeth', 'Exercise', 'Go to work'], correct_answer: 'Brush teeth' }
        ]
      },
      {
        title: 'Technology News',
        subtitle: 'Tin tức về công nghệ mới nhất',
        type: 'news',
        level: 'B1',
        duration: 45,
        audio_url: 'https://example.com/audio/tech_news.mp3',
        transcript: 'A new smartphone was released today...',
        questions_json: [
          { id: 1, question: 'What was released today?', options: ['A laptop', 'A smartphone', 'A tablet', 'A watch'], correct_answer: 'A smartphone' }
        ]
      },
    ]);
    console.log(`✅ Created ${listeningExercises.length} listening exercises`);

    // 5. Tạo writing exercises
    const writingExercises = await WritingExercise.create([
      {
        title: 'Describe Your Hometown',
        topic: 'Write a paragraph describing your hometown. Include its location, famous places, and why you like it.',
        sample_answer: 'My hometown is a small city in the north of Vietnam...'
      },
      {
        title: 'Benefits of Learning English',
        topic: 'Discuss the benefits of learning English in today\'s globalized world.',
        sample_answer: 'Learning English opens many opportunities...'
      }
    ]);
    console.log(`✅ Created ${writingExercises.length} writing exercises`);

    // 6. Tạo reading lessons (sử dụng Lesson model với type='reading')
    const readingLessons = await Lesson.create([
      { title: 'Travel Destinations', description: 'Bài đọc về những điểm đến du lịch nổi tiếng thế giới', type: 'reading', category: 'Du lịch', icon: '✈️', level: 'A2', content: { text: 'Traveling is one of the best ways to learn about new cultures...' } },
      { title: 'Technology in Daily Life', description: 'Công nghệ đã thay đổi cuộc sống hàng ngày như thế nào', type: 'reading', category: 'Công nghệ', icon: '💻', level: 'B1', content: { text: 'Technology has become an essential part of our daily lives...' } },
      { title: 'Healthy Living Tips', description: 'Lời khuyên về sức khỏe và lối sống lành mạnh', type: 'reading', category: 'Sức khỏe', icon: '🏥', level: 'B1', content: { text: 'Maintaining a healthy lifestyle is important for everyone...' } },
    ]);
    console.log(`✅ Created ${readingLessons.length} reading lessons`);

    // 8. Tạo tests theo category
    // 8a. TOEIC Tests
    const toeicTest1 = await Test.create({
      title: 'TOEIC Full Test #1',
      description: 'Đề thi TOEIC mô phỏng đầy đủ 7 phần - ETS 2026',
      category: 'toeic',
      type: 'full_test',
      total_questions: 200,
      duration_minutes: 120
    });

    const toeicTest2 = await Test.create({
      title: 'TOEIC Full Test #2',
      description: 'Đề thi TOEIC mô phỏng - YBM 2025',
      category: 'toeic',
      type: 'full_test',
      total_questions: 200,
      duration_minutes: 120
    });

    // 8b. THPT Tests — Dữ liệu đề thi THPT Quốc gia
    const thptSections = [
      // ═══════════════════════ PHẦN 1: CÂU 1-6 — ĐỌC ĐIỀN (LEAFLET) ═══════════════════════
      {
        id: 'section1', type: 'fill_in_blank',
        instruction: 'Read the following leaflet and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks from 1 to 6.',
        title: 'GREEN HANDS CAMPAIGN',
        passage: 'The School Youth Union is officially launching the "Green Hands" eco-friendly campaign. We invite every student to participate in this vital project. If everyone (1)_____ together, we will make a difference at our school.\nThe primary goal is to expand students\' (2)_____ of plastic pollution. To achieve this, the school will have colour-coded bins (3)_____ in the schoolyard. Also, waste-disposal workshops will be held to teach students to (4)_____ out plastics properly. These sessions ensure resources are reused effectively.\nWe aim to (5)_____ sustainable habits through consistent daily activities. We firmly believe that small individual efforts will turn into long-lasting changes.\nVolunteers will help remove plastics from every corner of the schoolyard. Please sign up online. Your (6)_____ is essential for success. Don\'t miss out – join hands with us today!',
        questions: [
          { id: 1, blank: 1, answerLabel: 'A', options: [{ label: 'A', text: 'work' }, { label: 'B', text: 'worked' }, { label: 'C', text: 'have worked' }, { label: 'D', text: 'works' }] },
          { id: 2, blank: 2, answerLabel: 'D', options: [{ label: 'A', text: 'focus' }, { label: 'B', text: 'attention' }, { label: 'C', text: 'emphasis' }, { label: 'D', text: 'knowledge' }] },
          { id: 3, blank: 3, answerLabel: 'C', options: [{ label: 'A', text: 'install' }, { label: 'B', text: 'being installed' }, { label: 'C', text: 'installed' }, { label: 'D', text: 'installing' }] },
          { id: 4, blank: 4, answerLabel: 'D', options: [{ label: 'A', text: 'catch' }, { label: 'B', text: 'check' }, { label: 'C', text: 'fill' }, { label: 'D', text: 'sort' }] },
          { id: 5, blank: 5, answerLabel: 'A', options: [{ label: 'A', text: 'promote' }, { label: 'B', text: 'protect' }, { label: 'C', text: 'provide' }, { label: 'D', text: 'produce' }] },
          { id: 6, blank: 6, answerLabel: 'B', options: [{ label: 'A', text: 'cooperate' }, { label: 'B', text: 'cooperation' }, { label: 'C', text: 'cooperatively' }, { label: 'D', text: 'cooperative' }] }
        ]
      },
      // ═══════════════════════ PHẦN 2: CÂU 7-11 — SẮP XẾP CÂU ═══════════════════════
      {
        id: 'section2', type: 'sentence_arrangement',
        instruction: 'Mark the letter A, B, C or D on your answer sheet to indicate the best arrangement of utterances or sentences to make a cohesive and coherent exchange or text in each of the following questions from 7 to 11.',
        questions: [
          {
            id: 7, context: 'Dear Mr Tran,', ending: 'Yours sincerely,',
            sentences: [
              { key: 'a', text: 'To accept this scholarship, please sign the attached agreement and submit it before 15 July.' },
              { key: 'b', text: 'Your performance during the selection process reflects dedication and potential.' },
              { key: 'c', text: 'The grant covers full tuition for the programme and a monthly allowance of $500.' },
              { key: 'd', text: 'It is our great pleasure to inform you that you have been selected as a recipient of the Pinnacle Scholarship for the 2026-2027 academic year.' },
              { key: 'e', text: 'Should you have questions regarding the terms or conditions, please contact our admissions office.' }
            ],
            options: [
              { label: 'A', text: 'd-c-e-a-b' }, { label: 'B', text: 'd-e-b-c-a' },
              { label: 'C', text: 'd-b-c-a-e' }, { label: 'D', text: 'd-a-e-b-c' }
            ],
            answerLabel: 'C'
          },
          {
            id: 8,
            sentences: [
              { key: 'a', text: 'Customer: Here you are. Thanks for your help.' },
              { key: 'b', text: 'Customer: I\'ve booked an online ticket for the concert this weekend, but haven\'t got the confirmation email.' },
              { key: 'c', text: 'Assistant: Please show me the receipt and I\'ll check it immediately.' }
            ],
            options: [
              { label: 'A', text: 'b-a-c' }, { label: 'B', text: 'a-b-c' },
              { label: 'C', text: 'b-c-a' }, { label: 'D', text: 'a-c-b' }
            ],
            answerLabel: 'C'
          },
          {
            id: 9,
            sentences: [
              { key: 'a', text: 'The convenience, however, carries inherent risks, because every connected device is a potential entry point for hackers to steal sensitive data.' },
              { key: 'b', text: 'Smart homes have become essential features of modern life, transforming how individuals manage their domestic environments efficiently.' },
              { key: 'c', text: 'The integrated systems offer convenience, such as turning off the oven from afar or locking doors with a single smartphone tap.' },
              { key: 'd', text: 'Anyone investing in smart hardware should carefully weigh the appeal of automation against the time and care required to keep a home network secure.' },
              { key: 'e', text: 'A poorly updated router or a default password left unchanged has, in several recent reported cases, allowed strangers to listen in on private family conversations.' }
            ],
            options: [
              { label: 'A', text: 'e-d-c-a-b' }, { label: 'B', text: 'c-a-d-b-e' },
              { label: 'C', text: 'b-c-a-e-d' }, { label: 'D', text: 'd-e-b-c-a' }
            ],
            answerLabel: 'C'
          },
          {
            id: 10,
            sentences: [
              { key: 'a', text: 'Celine: Why do you say so?' },
              { key: 'b', text: 'Celine: I\'ve been considering taking a gap year. What\'s your view?' },
              { key: 'c', text: 'Celine: Thanks. I\'ll think about it.' },
              { key: 'd', text: 'Steward: The thing is, your studies won\'t be interrupted.' },
              { key: 'e', text: 'Steward: If I were you, I would go to university right after graduating from high school.' }
            ],
            options: [
              { label: 'A', text: 'b-e-a-d-c' }, { label: 'B', text: 'b-d-a-e-c' },
              { label: 'C', text: 'a-d-b-e-c' }, { label: 'D', text: 'a-e-b-d-c' }
            ],
            answerLabel: 'A'
          },
          {
            id: 11,
            sentences: [
              { key: 'a', text: 'Early data from the first quarter revealed a fifteen percent reduction in peak-hour delays and noticeably cleaner air across central wards.' },
              { key: 'b', text: 'Motorists entering the central zone had to pay a fee, with the generated revenue allocated for cycle lanes and bus routes.' },
              { key: 'c', text: 'Years of unchecked expansion of private vehicle ownership had rendered the commute in Stoneville the slowest in the region.' },
              { key: 'd', text: 'The encouraging outcomes suggested that the scheme would be expanded to other districts.' },
              { key: 'e', text: 'The city authorities implemented a simple yet controversial intervention: charging a congestion fee.' }
            ],
            options: [
              { label: 'A', text: 'b-a-d-e-c' }, { label: 'B', text: 'c-e-b-a-d' },
              { label: 'C', text: 'e-b-d-c-a' }, { label: 'D', text: 'a-e-d-c-b' }
            ],
            answerLabel: 'B'
          }
        ]
      },
      // ═══════════════════════ PHẦN 3: CÂU 12-16 — ĐỌC HIỂU (WEALTH) ═══════════════════════
      {
        id: 'section3', type: 'reading_comprehension',
        instruction: 'Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks from 12 to 16.',
        passage: 'Among the many paradoxes surrounding money, one deserves particular attention: the wealth that truly counts is precisely the wealth you cannot observe. When a sleek Lamborghini glides past, it is normal (12)_____. Closer inspection often tells a different story. A large number of those who drive luxury vehicles are, in fact, only modest earners (13)_____ to the privilege of being seen in such a car. It is uncertain to say whether someone driving a car worth one hundred thousand pounds is affluent. Yet the certain thing is that they have one hundred thousand pounds less than they did before they got the car, or one hundred thousand pounds more in debt. (14)_____\nWe tend to judge wealth by what we see as visible details are the only evidence we have access to. Nobody walks around displaying a printout of their savings, (15)_____ — handbags, holiday villas, posts on social networks — to decide who is prospering. Contemporary marketing has fed this habit, packaging the illusion of success as a saleable product. (16)_____. It hides in the upgrade declined, the jewellery left in the display case, the watch never bought, the wardrobe never expanded and the business-class seat politely waved away.\nIn short, wealth is whatever money has not yet been swapped for tangible goods. That is why distinguishing wealthy from rich deserves careful thought; mistaking one for the other has quietly ruined many a budget.',
        source: '(Adapted from Psychology of Money)',
        questions: [
          { id: 12, text: '', options: [{ label: 'A', text: 'for concluding that the person must be doing well behind the wheel' }, { label: 'B', text: 'a good conclusion about whoever sits behind the wheel must be' }, { label: 'C', text: 'a good conclusion about the wheel behind which the person must sit' }, { label: 'D', text: 'to conclude that whoever sits behind the wheel must be doing well' }], answerLabel: 'D' },
          { id: 13, text: '', options: [{ label: 'A', text: 'who have committed a disproportionate share of their monthly pay' }, { label: 'B', text: 'a disproportionate share of whose monthly pay is committed' }, { label: 'C', text: 'whose monthly pay is disproportionately committed to sharing' }, { label: 'D', text: 'who are committed to sharing their monthly pay disproportionately' }], answerLabel: 'A' },
          { id: 14, text: '', options: [{ label: 'A', text: 'You know that it is beyond nothing at all' }, { label: 'B', text: 'Beyond your knowledge, that is nothing' }, { label: 'C', text: 'Beyond that, you know nothing at all' }, { label: 'D', text: 'Beyond that, nothing is unknown to you' }], answerLabel: 'C' },
          { id: 15, text: '', options: [{ label: 'A', text: 'so we instead rely on their outward appearances' }, { label: 'B', text: 'instead they rely on the appearances on the outside' }, { label: 'C', text: 'instead of their reliable outward appearances' }, { label: 'D', text: 'yet they appear reliable on the outside instead' }], answerLabel: 'A' },
          { id: 16, text: '', options: [{ label: 'A', text: 'Indeed, wealth in reality is advertised as the refusal of authenticity itself' }, { label: 'B', text: 'However, the reality is that authentic wealth refuses to advertise itself' }, { label: 'C', text: 'Real wealth itself, in reality, is advertised to refuse to be authentic' }, { label: 'D', text: 'Authentic advertisements are, therefore, the refusal of real wealth itself' }], answerLabel: 'B' }
        ]
      },
      // ═══════════════════════ PHẦN 4: CÂU 17-26 — ĐỌC HIỂU (ENVIRONMENT) ═══════════════════════
      {
        id: 'section4', type: 'reading_comprehension',
        instruction: 'Read the passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 17 to 26.',
        passage: 'It is important to stress that environmental services have costs, even when they are produced without any human input. All costs ought to be measured as opportunity costs. The opportunity cost for environmental services is the net benefit forgone because the resources providing the service can no longer be used in the next most beneficial way. Resources are not free if they can be put to alternative uses.\nConsider a stretch of river that can be used either for white-water canoeing or for electric power generation. Because the dam that generates the power would flood the rapids, the two uses are incompatible. The opportunity cost of saving the river for white-water canoeing is the net benefit taken out – after accounting for the cost of generation and distribution – for electricity. Conversely, the opportunity cost of building the dam is everything the unspoiled river would have produced: the recreation, the wildlife, the scenery, and whatever value future generations might place upon experiencing the rapids themselves.\nThis insight has far-reaching implications for development policy. [I] Many decisions that appear at first to be costless choices in favour of growth turn out, on closer inspection, to be choices against something else. [II] Cutting down a forest for cropland is not free; it is paid for in carbon storage, biodiversity, and the regulating services the forest performed silently. [III] Diverting a river to irrigate fields is not free; the price is whatever the river was doing before the diversion. [IV] Even leaving land untouched is not free, for the income that intensive use might have generated is traded off as well.\nEconomic development, in this view, is never simply a question of whether a project yields a positive return. It is a question of whether the return exceeds the value of what must be relinquished. Policies that recognise this – by attaching prices to scarce environmental services, or by requiring decision-makers to weigh both sides of the account – do not stand against development. They insist that the development chosen be worth what it truly costs. The danger lies not in counting too much, but in counting too little.',
        source: '(Adapted from Environmental Economics and Policy)',
        questions: [
          { id: 17, text: 'The word "forgone" in paragraph 1 is closest in meaning to _____.', options: [{ label: 'A', text: 'given up' }, { label: 'B', text: 'ended up' }, { label: 'C', text: 'filled up' }, { label: 'D', text: 'made up' }], answerLabel: 'A' },
          { id: 18, text: 'According to paragraph 1, the costs of environmental services are _____.', options: [{ label: 'A', text: 'calculated based on the direct financial input provided for natural resources' }, { label: 'B', text: 'determined by the market value of the natural resources themselves' }, { label: 'C', text: 'insignificant as these services require almost no human labour to produce' }, { label: 'D', text: 'present whether or not human effort is involved in creating these services' }], answerLabel: 'D' },
          { id: 19, text: 'Which of the following is NOT implied in paragraph 2?', options: [{ label: 'A', text: 'Hydroelectric generation and white-water canoeing cannot coexist on the same stretch of river.' }, { label: 'B', text: 'The opportunity cost of the dam construction includes intangible benefits that are sacrificed.' }, { label: 'C', text: 'Recreational activities and power generation impose equal environmental burdens on the river.' }, { label: 'D', text: 'The intrinsic value attached to the river may extend beyond its potential use for hydroelectric generation.' }], answerLabel: 'C' },
          { id: 20, text: 'Where in paragraph 3 does the following sentence best fit?\n"Such hidden costs become apparent only when one pauses to consider what nature was quietly doing on its own."', options: [{ label: 'A', text: '[III]' }, { label: 'B', text: '[II]' }, { label: 'C', text: '[IV]' }, { label: 'D', text: '[I]' }], answerLabel: 'B' },
          { id: 21, text: 'Which of the following best summarises paragraph 3?', options: [{ label: 'A', text: 'Policymakers should take the management of natural resources into consideration.' }, { label: 'B', text: 'Initiatives that are perceived as harmless may actually involve underlying sacrifices.' }, { label: 'C', text: 'Long-term ecological balance usually takes precedence over immediate financial gain.' }, { label: 'D', text: 'Economic growth schemes should be halted once ecological disruption is detected.' }], answerLabel: 'B' },
          { id: 22, text: 'The word "They" in paragraph 4 refers to _____.', options: [{ label: 'A', text: 'services' }, { label: 'B', text: 'policies' }, { label: 'C', text: 'prices' }, { label: 'D', text: 'sides' }], answerLabel: 'B' },
          { id: 23, text: 'What conclusion can be drawn from paragraph 4?', options: [{ label: 'A', text: 'Deducting the hidden costs is obligatory after a project claims to have a positive return.' }, { label: 'B', text: 'Regulations pricing natural resources are inherently harmful to growth.' }, { label: 'C', text: 'Damage caused by intentional ignorance regarding environmental costs is permanent.' }, { label: 'D', text: 'Considering opportunity costs ensures that development is truly justified.' }], answerLabel: 'D' },
          { id: 24, text: 'Which of the following is true according to the passage?', options: [{ label: 'A', text: 'Opportunity costs are determined by the going rate for environmental services.' }, { label: 'B', text: 'Financial gain is the primary criterion for evaluating development projects.' }, { label: 'C', text: 'The true value of a project is measured not merely by its economic benefits.' }, { label: 'D', text: 'Preserving land in its natural state is economically sound as it consumes no resources.' }], answerLabel: 'C' },
          { id: 25, text: 'Which of the following can be inferred from the passage?', options: [{ label: 'A', text: 'Policies that price environmental services are intended to restrict the scope of economic development.' }, { label: 'B', text: 'The benefits of industrial development generally exceed the value of preserved environmental services.' }, { label: 'C', text: 'Projects are forced to compensate for the economic losses in return for environmental preservation.' }, { label: 'D', text: 'The net gains produced by development projects overlooking opportunity costs tend to be overestimated.' }], answerLabel: 'D' },
          { id: 26, text: 'Which of the following would be the best title for the passage?', options: [{ label: 'A', text: 'Environmental Policies in the Firing Line' }, { label: 'B', text: 'Natural Preservation: Ushering in a New Era' }, { label: 'C', text: 'Development: Factoring in Sacrifices' }, { label: 'D', text: 'Economic Development on the Line' }], answerLabel: 'C' }
        ]
      },
      // ═══════════════════════ PHẦN 5: CÂU 27-32 — ĐỌC ĐIỀN (ADVERTISEMENT) ═══════════════════════
      {
        id: 'section5', type: 'fill_in_blank',
        instruction: 'Read the following advertisement and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks from 27 to 32.',
        title: 'SUMMER PART-TIME JOBS FOR UNDERGRADUATES',
        passage: 'Techworld Magazine is delighted to announce two IT assistant vacancies up for (27)_____ this summer. The better understanding of STEM you have, (28)_____ likely you are to be selected! Successful applicants will get plenty of hands-on experience, good pay, and access to the local STEM community.\n(29)_____, we offer flexible working hours and remote options for those living far away. On top of that, (30)_____ position requires previous experience as new recruits are provided with in-service training sessions.\nApplications (31)_____ be submitted to us at info@techworldmagazine.com by 30 June.\nNever before has there been such a(n) (32)_____ opportunity to kick-start your career in STEM. Don\'t let this chance slip through your fingers – apply today!',
        questions: [
          { id: 27, blank: 27, options: [{ label: 'A', text: 'grasp' }, { label: 'B', text: 'gift' }, { label: 'C', text: 'grips' }, { label: 'D', text: 'grabs' }], answerLabel: 'D' },
          { id: 28, blank: 28, options: [{ label: 'A', text: 'the most' }, { label: 'B', text: 'most' }, { label: 'C', text: 'more' }, { label: 'D', text: 'the more' }], answerLabel: 'D' },
          { id: 29, blank: 29, options: [{ label: 'A', text: 'Additionally' }, { label: 'B', text: 'Consequently' }, { label: 'C', text: 'Subsequently' }, { label: 'D', text: 'Finally' }], answerLabel: 'A' },
          { id: 30, blank: 30, options: [{ label: 'A', text: 'neither' }, { label: 'B', text: 'both' }, { label: 'C', text: 'none' }, { label: 'D', text: 'either' }], answerLabel: 'C' },
          { id: 31, blank: 31, options: [{ label: 'A', text: 'ought' }, { label: 'B', text: 'should' }, { label: 'C', text: 'ought not' }, { label: 'D', text: 'should not' }], answerLabel: 'B' },
          { id: 32, blank: 32, options: [{ label: 'A', text: 'lively' }, { label: 'B', text: 'active' }, { label: 'C', text: 'golden' }, { label: 'D', text: 'private' }], answerLabel: 'C' }
        ]
      },
      // ═══════════════════════ PHẦN 6: CÂU 33-40 — ĐỌC HIỂU (NOTETAKING) ═══════════════════════
      {
        id: 'section6', type: 'reading_comprehension',
        instruction: 'Read the passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 33 to 40.',
        passage: 'For decades, students have been convinced that academic success is largely dependent upon meticulous notetaking. What has changed in recent years is not the importance of the practice but the tools used to perform it. The keyboard has subtly supplanted the pen, and with it, the nature of how information is recorded during a lecture has shifted unbeknownst to students.\nResearchers in cognitive psychology have begun to examine what this change has cost learners. In a series of comparative studies, students taking notes by hand consistently outperformed those using laptops on questions that demanded conceptual understanding, even when both groups had access to the same material. The reason, according to the researchers, lies less in the technology itself than in what each method asks of the brain. Typing rewards speed; handwriting forces selection.\nThe act of writing by hand is slower, and that slowness appears to be its hidden virtue. Unable to capture every word, students are obliged to listen, decide what matters and condense ideas into their own phrasing. This continuous filtering, referred to as encoding by psychologists, turns out to be instrumental in aiding long-term recall. One lecturer summarised the striking contrast after reviewing her students\' work: the laptops, she said, had produced transcripts, while the notebooks had produced understanding.\nIt would be misleading, of course, to claim that handwriting is inherently superior or that all keyboards undermine learning. Hard-working typists can summarise, while indolent writers can drift. What the research highlights is not a conclusion on devices but a question about effort: which tool, in a given context, asks more of the learner. As a ban on students\' use of laptops in classrooms remains a bone of contention among tertiary institutions, the deeper challenge may be helping students recognise that what feels easier in the moment is not always what serves them best afterwards.',
        source: '(Adapted from https://www.brookings.edu)',
        questions: [
          { id: 33, text: 'In paragraph 1, the writer is _____.', options: [{ label: 'A', text: 'introducing a recent change in the way students take notes' }, { label: 'B', text: 'challenging a long-held assumption about academic success' }, { label: 'C', text: 'promoting the use of technology in recording lectures' }, { label: 'D', text: 'questioning the significance of notetaking in education' }], answerLabel: 'A' },
          { id: 34, text: 'The word "those" in paragraph 2 refers to _____.', options: [{ label: 'A', text: 'students' }, { label: 'B', text: 'researchers' }, { label: 'C', text: 'studies' }, { label: 'D', text: 'notes' }], answerLabel: 'A' },
          { id: 35, text: 'Which of the following best paraphrases the underlined sentence in paragraph 2?', options: [{ label: 'A', text: 'The modern device, along with the mental requirements of each method for the brain, is responsible for the difference in student performance.' }, { label: 'B', text: 'What explains the difference in student performance is the mental work that each method of notetaking demands, rather than the technology.' }, { label: 'C', text: 'The difference in student performance is attributable to the modern technology instead of the mental work that each method of notetaking requires.' }, { label: 'D', text: 'Regardless of the method of notetaking, the effects on the brain exhibit little difference as long as technology is involved in student performance.' }], answerLabel: 'B' },
          { id: 36, text: 'The word "instrumental" in paragraph 3 is OPPOSITE in meaning to _____.', options: [{ label: 'A', text: 'trivial' }, { label: 'B', text: 'specific' }, { label: 'C', text: 'dramatic' }, { label: 'D', text: 'central' }], answerLabel: 'A' },
          { id: 37, text: 'The word "indolent" in paragraph 4 is closest in meaning to _____.', options: [{ label: 'A', text: 'serious' }, { label: 'B', text: 'lazy' }, { label: 'C', text: 'careful' }, { label: 'D', text: 'active' }], answerLabel: 'B' },
          { id: 38, text: 'Which of the following statements would the writer NOT agree with?', options: [{ label: 'A', text: 'Handwritten and typed notes led to varied degrees of conceptual understanding.' }, { label: 'B', text: 'The slow speed of writing by hand turns out to be an advantage over typing.' }, { label: 'C', text: 'Students are unaware of the change in notetaking methods in class.' }, { label: 'D', text: 'Universities generally approve of prohibiting laptop use in classrooms.' }], answerLabel: 'D' },
          { id: 39, text: 'In which paragraph does the writer mention a cognitive process?', options: [{ label: 'A', text: 'Paragraph 2' }, { label: 'B', text: 'Paragraph 1' }, { label: 'C', text: 'Paragraph 3' }, { label: 'D', text: 'Paragraph 4' }], answerLabel: 'C' },
          { id: 40, text: 'In which paragraph does the writer warn against an overgeneralisation?', options: [{ label: 'A', text: 'Paragraph 2' }, { label: 'B', text: 'Paragraph 1' }, { label: 'C', text: 'Paragraph 3' }, { label: 'D', text: 'Paragraph 4' }], answerLabel: 'D' }
        ]
      }
    ];

    const thptTest1 = await Test.create({
      title: 'KỲ THI TỐT NGHIỆP THPT NĂM 2026',
      description: 'Môn thi: TIẾNG ANH - Mã đề 1101 - 50 phút',
      category: 'thpt',
      type: 'full_test',
      total_questions: 40,
      duration_minutes: 50
    });

    const thptTest2 = await Test.create({
      title: 'Đề thi THPT Quốc gia 2024 - Mã đề 102',
      description: 'Đề thi chính thức kỳ thi THPT Quốc gia môn Tiếng Anh',
      category: 'thpt',
      type: 'full_test',
      total_questions: 50,
      duration_minutes: 60
    });

    // Gán content cho THPT Test 1 (cấu trúc đề thi đầy đủ)
    await Test.findByIdAndUpdate(thptTest1._id, { content: { sections: thptSections } });
    // Gán content cho THPT Test 2 (dùng 3 section đầu làm mẫu)
    await Test.findByIdAndUpdate(thptTest2._id, { content: { sections: thptSections } });

    console.log(`✅ Created ${await Test.countDocuments()} tests`);

    // 9. Tạo questions
    // Helper: random ObjectId-like string
    const makeId = () => new mongoose.Types.ObjectId();

    // 9a. TOEIC Test 1 - Part 1: Photos (6 questions)
    const p1_instruction = 'Select the one statement that best describes what you see in the picture.';
    const toeic1_part1_parents = [];
    for (let i = 0; i < 6; i++) {
      const parent = await Question.create({
        test_id: toeicTest1._id,
        part: 1,
        question_type: 'listening_photo',
        instruction: p1_instruction,
        question_text: '',
        options_json: ['(A) The man is reading a book', '(B) The woman is typing on a laptop', '(C) They are having a meeting', '(D) The office is empty'],
        correct_answer: 'B',
        image_url: `https://images.unsplash.com/photo-${1556909114 + i}?w=300&q=80`
      });
      toeic1_part1_parents.push(parent);
    }

    // 9b. TOEIC Test 1 - Part 5: Incomplete Sentences (30 questions)
    for (let i = 0; i < 10; i++) {
      await Question.create({
        test_id: toeicTest1._id,
        part: 5,
        question_type: 'reading_grammar',
        instruction: 'Select the best answer to complete the sentence.',
        question_text: `${i + 1}. The new policy will take effect ------- next month.`,
        options_json: ['(A) on', '(B) in', '(C) at', '(D) from'],
        correct_answer: 'B'
      });
    }

    // 9c. TOEIC Test 1 - Part 7: Reading Comprehension (1 passage with 4 questions)
    const passageParent = await Question.create({
      test_id: toeicTest1._id,
      part: 7,
      question_type: 'reading_passage',
      instruction: 'Questions 147-150 refer to the following notice.',
      question_text: '',
      passage: `Dear High View Apartments Resident,\n\nRiverside Paving Company is coming to High View Apartments on May 3 and 4 to resurface the parking area. All vehicles must be removed by 8 A.M. on May 3 for the work to commence. Residents may use the parking area again starting on May 5 at 8 A.M. We realize that trying to find another place to park is inconvenient, but it is necessary for the job to be completed in the two days scheduled. Note that all parking spaces will be widened, and some spaces could be moved during the work. You will receive an e-mail if your parking space is moved more than 20 meters from your previous one.\n\nThank you for your cooperation,\n\nJudith Alvarez, Property Manager`,
      group_label: 'Questions 147-150',
      options_json: [],
      correct_answer: 'A'
    });

    await Question.create([
      {
        test_id: toeicTest1._id,
        part: 7,
        parent_id: passageParent._id,
        question_type: 'reading_passage',
        question_text: '147. What is the purpose of the notice?',
        options_json: ['(A) To inform residents of an upcoming project', '(B) To request feedback about parking facilities', '(C) To invite residents to a meeting on May 3', '(D) To announce an increase in parking fees'],
        correct_answer: 'A'
      },
      {
        test_id: toeicTest1._id,
        part: 7,
        parent_id: passageParent._id,
        question_type: 'reading_passage',
        question_text: '148. What is suggested about High View Apartments?',
        options_json: ['(A) It charges residents a monthly maintenance fee.', '(B) It recently hired a new property manager.', '(C) It has the parking area repaved every year.', '(D) It assigns tenants specific parking spots.'],
        correct_answer: 'D'
      },
      {
        test_id: toeicTest1._id,
        part: 7,
        parent_id: passageParent._id,
        question_type: 'reading_passage',
        question_text: '149. When must residents remove their vehicles?',
        options_json: ['(A) By May 3 at 8 A.M.', '(B) By May 4 at 8 A.M.', '(C) By May 5 at 8 A.M.', '(D) By May 3 at 8 P.M.'],
        correct_answer: 'A'
      },
      {
        test_id: toeicTest1._id,
        part: 7,
        parent_id: passageParent._id,
        question_type: 'reading_passage',
        question_text: '150. What will happen if a parking space is moved significantly?',
        options_json: ['(A) The resident will receive an e-mail.', '(B) The resident will get a discount.', '(C) The resident must park elsewhere.', '(D) The resident can request a refund.'],
        correct_answer: 'A'
      }
    ]);

    // 9d. THPT Test 2 - 5 multiple choice questions
    for (let i = 0; i < 5; i++) {
      await Question.create({
        test_id: thptTest2._id,
        part: null,
        question_type: 'multiple_choice',
        instruction: 'Mark the letter A, B, C, or D to indicate the correct answer.',
        question_text: `Question ${i + 1}: She ______ English for 5 years.`,
        options_json: ['(A) studies', '(B) studied', '(C) has studied', '(D) is studying'],
        correct_answer: 'C'
      });
    }

    console.log(`✅ Created ${await Question.countDocuments()} questions`);

    // 10. Tạo user test results
    const results = await UserTestResult.create([
      {
        user_id: user1._id,
        test_id: toeicTest1._id,
        score: 85.5,
        total_questions: 200,
        correct_answers: 171,
        wrong_answers: 29,
        completed_at: new Date()
      },
      {
        user_id: user1._id,
        test_id: toeicTest2._id,
        score: 75.0,
        total_questions: 200,
        correct_answers: 150,
        wrong_answers: 50,
        completed_at: new Date()
      },
      {
        user_id: user2._id,
        test_id: toeicTest1._id,
        score: 95.0,
        total_questions: 200,
        correct_answers: 190,
        wrong_answers: 10,
        completed_at: new Date()
      }
    ]);
    console.log(`✅ Created ${results.length} test results`);

    // 11. Tạo chat sessions
    const session1 = await ChatSession.create({
      user_id: user1._id,
      session_title: 'Learning about greetings'
    });

    const session2 = await ChatSession.create({
      user_id: user2._id,
      session_title: 'Practice pronunciation'
    });
    console.log(`✅ Created ${await ChatSession.countDocuments()} chat sessions`);

    // 12. Tạo chat messages
    const messages = await ChatMessage.create([
      {
        session_id: session1._id,
        sender: 'user',
        message_text: 'How do I say "Xin chào" in English?'
      },
      {
        session_id: session1._id,
        sender: 'ai',
        message_text: 'You can say "Hello" or "Hi" in English.',
        pronunciation_score: 9.5
      },
      {
        session_id: session1._id,
        sender: 'user',
        message_text: 'Thank you!',
        audio_url: 'https://example.com/audio/thankyou.mp3'
      },
      {
        session_id: session2._id,
        sender: 'user',
        message_text: 'How to pronounce "beautiful"?',
        audio_url: 'https://example.com/audio/beautiful_user.mp3'
      },
      {
        session_id: session2._id,
        sender: 'ai',
        message_text: 'Beautiful is pronounced as /ˈbjuːtɪfl/. Listen to this:',
        audio_url: 'https://example.com/audio/beautiful_ai.mp3',
        pronunciation_score: 8.5
      }
    ]);
    console.log(`✅ Created ${messages.length} chat messages`);

    console.log('\n🎉 SEED DATA COMPLETED SUCCESSFULLY!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Vocabularies: ${await Vocabulary.countDocuments()}`);
    console.log(`   - Grammar Rules: ${await GrammarRule.countDocuments()}`);
    console.log(`   - Listening Exercises: ${await ListeningExercise.countDocuments()}`);
    console.log(`   - Writing Exercises: ${await WritingExercise.countDocuments()}`);
    console.log(`   - Tests: ${await Test.countDocuments()}`);
    console.log(`   - Questions: ${await Question.countDocuments()}`);
    console.log(`   - Test Results: ${await UserTestResult.countDocuments()}`);
    console.log(`   - Chat Sessions: ${await ChatSession.countDocuments()}`);
    console.log(`   - Chat Messages: ${await ChatMessage.countDocuments()}`);

    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User1: john@example.com / john123');
    console.log('   User2: jane@example.com / jane123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
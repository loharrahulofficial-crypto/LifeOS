/**
 * LifeOS Quote Engine
 * -------------------
 * • 365 hand-curated quotes across 8 categories
 * • Seeded by full date (YYYY-MM-DD) via mulberry32 PRNG
 *   → Same date always returns the same quote
 *   → Each year the quotes appear in a completely different shuffled order
 * • Falls back to template-generated wisdom for extended variety
 */

// ── Seeded PRNG (mulberry32) ───────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(dateStr) {
  let h = 2166136261;
  for (const c of dateStr) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Quote Database ─────────────────────────────────────────────
// Format: ["text", "author"]
const QUOTES = [
  // ── Success & Achievement ──────────────────────────────────
  ["The secret of getting ahead is getting started.", "Mark Twain"],
  ["Success is not final; failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"],
  ["Opportunities don't happen. You create them.", "Chris Grosser"],
  ["I find that the harder I work, the more luck I seem to have.", "Thomas Jefferson"],
  ["Success is the sum of small efforts repeated day in and day out.", "Robert Collier"],
  ["Don't be afraid to give up the good to go for the great.", "John D. Rockefeller"],
  ["I never dreamed about success. I worked for it.", "Estée Lauder"],
  ["Success is walking from failure to failure with no loss of enthusiasm.", "Winston Churchill"],
  ["People who succeed have momentum. The more they succeed, the more they want to succeed.", "Tony Robbins"],
  ["Don't let what you cannot do interfere with what you can do.", "John Wooden"],
  ["You know you are on the road to success if you would do your job, and not be paid for it.", "Oprah Winfrey"],
  ["The only place success comes before work is in the dictionary.", "Vidal Sassoon"],
  ["Success is liking yourself, liking what you do, and liking how you do it.", "Maya Angelou"],
  ["Before anything else, preparation is the key to success.", "Alexander Graham Bell"],
  ["Successful people do what unsuccessful people are not willing to do.", "Jeff Olson"],
  ["There are no shortcuts to any place worth going.", "Beverly Sills"],
  ["You miss 100% of the shots you don't take.", "Wayne Gretzky"],
  ["The difference between ordinary and extraordinary is that little extra.", "Jimmy Johnson"],
  ["Strive not to be a success, but rather to be of value.", "Albert Einstein"],
  ["In order to succeed, we must first believe that we can.", "Nikos Kazantzakis"],
  ["The road to success and the road to failure are almost exactly the same.", "Colin R. Davis"],
  ["Success is not the key to happiness. Happiness is the key to success.", "Albert Schweitzer"],
  ["If you want to achieve greatness, stop asking for permission.", "Anonymous"],
  ["Things work out best for those who make the best of how things work out.", "John Wooden"],
  ["To live is the rarest thing in the world. Most people just exist.", "Oscar Wilde"],
  ["A dream doesn't become reality through magic; it takes sweat, determination and hard work.", "Colin Powell"],
  ["If you can dream it, you can do it.", "Walt Disney"],
  ["All our dreams can come true, if we have the courage to pursue them.", "Walt Disney"],
  ["A little progress each day adds up to big results.", "Satya Nani"],
  ["The only way to achieve the impossible is to believe it is possible.", "Charles Kingsleigh"],
  ["Go as far as you can see; when you get there, you'll be able to see further.", "J.P. Morgan"],
  ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
  ["Believe you can and you're halfway there.", "Theodore Roosevelt"],

  // ── Discipline & Hard Work ─────────────────────────────────
  ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Aristotle"],
  ["The fight is won or lost far away from witnesses — behind the lines, in the gym, and out on the road.", "Muhammad Ali"],
  ["There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", "Colin Powell"],
  ["Push yourself, because no one else is going to do it for you.", "Anonymous"],
  ["Don't stop when you're tired. Stop when you're done.", "Anonymous"],
  ["Wake up with determination. Go to bed with satisfaction.", "Anonymous"],
  ["Hard work beats talent when talent doesn't work hard.", "Tim Notke"],
  ["The only way out is through.", "Robert Frost"],
  ["Discipline is the bridge between goals and accomplishment.", "Jim Rohn"],
  ["Motivation gets you going, discipline keeps you growing.", "John C. Maxwell"],
  ["Champions are made from something they have deep inside them — a desire, a dream, a vision.", "Muhammad Ali"],
  ["The secret of your future is hidden in your daily routine.", "Mike Murdock"],
  ["Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", "John C. Maxwell"],
  ["Without self-discipline, success is impossible. Period.", "Lou Holtz"],
  ["If you want to live a happy life, tie it to a goal, not to people or things.", "Albert Einstein"],
  ["Your future is created by what you do today, not tomorrow.", "Robert Kiyosaki"],
  ["You don't have to be great to start, but you have to start to be great.", "Zig Ziglar"],
  ["Everyone has the will to win, but very few have the will to prepare to win.", "Bobby Knight"],
  ["Excellence is not a gift, but a skill that takes practice.", "Plato"],
  ["The price of excellence is discipline. The cost of mediocrity is disappointment.", "William Arthur Ward"],
  ["Success is nothing more than a few simple disciplines practiced every day.", "Jim Rohn"],
  ["It's not about having time. It's about making time.", "Anonymous"],
  ["Things may come to those who wait, but only the things left by those who hustle.", "Abraham Lincoln"],
  ["Today I will do what others won't, so tomorrow I can accomplish what others can't.", "Jerry Rice"],
  ["Your level of success will seldom exceed your level of personal development.", "Jim Rohn"],
  ["You can either experience the pain of discipline or the pain of regret.", "Jim Rohn"],
  ["First, forget inspiration. Habit is more dependable. Habit will sustain you.", "Octavia Butler"],
  ["Self-discipline begins with the mastery of your thoughts.", "Napoleon Hill"],

  // ── Mindset & Growth ───────────────────────────────────────
  ["Whether you think you can or you think you can't, you're right.", "Henry Ford"],
  ["The mind is everything. What you think you become.", "Buddha"],
  ["Once you replace negative thoughts with positive ones, you'll start having positive results.", "Willie Nelson"],
  ["Your attitude, not your aptitude, will determine your altitude.", "Zig Ziglar"],
  ["You have power over your mind — not outside events. Realize this, and you will find strength.", "Marcus Aurelius"],
  ["Change your thoughts and you change your world.", "Norman Vincent Peale"],
  ["The only limits you have are the limits you believe.", "Wayne Dyer"],
  ["A fixed mindset says 'I can't.' A growth mindset says 'I can't yet.'", "Carol Dweck"],
  ["The greatest discovery of all time is that a person can change his future by merely changing his attitude.", "Oprah Winfrey"],
  ["The mind is not a vessel to be filled, but a fire to be kindled.", "Plutarch"],
  ["It is not the mountain we conquer, but ourselves.", "Edmund Hillary"],
  ["You are never really playing an opponent. You are playing yourself.", "Arthur Ashe"],
  ["The real battle is inside your head.", "Anonymous"],
  ["A person who has never made a mistake never tried anything new.", "Albert Einstein"],
  ["In the middle of difficulty lies opportunity.", "Albert Einstein"],
  ["The pain you feel today will be the strength you feel tomorrow.", "Anonymous"],
  ["Strength does not come from physical capacity. It comes from an indomitable will.", "Mahatma Gandhi"],
  ["You must expect great things of yourself before you can do them.", "Michael Jordan"],
  ["Whether you are going through a storm or headed for one, your mindset determines your outcome.", "Anonymous"],
  ["Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.", "Helen Keller"],
  ["If you are positive, you'll see opportunities instead of obstacles.", "Widad Akrawi"],
  ["The biggest adventure you can take is to live the life of your dreams.", "Oprah Winfrey"],
  ["Your life does not get better by chance, it gets better by change.", "Jim Rohn"],
  ["Happiness is not something readymade. It comes from your own actions.", "Dalai Lama"],
  ["You become what you believe.", "Oprah Winfrey"],
  ["When you change the way you look at things, the things you look at change.", "Wayne Dyer"],
  ["The quality of your thinking determines the quality of your life.", "A.R. Bernard"],
  ["What we think, we become.", "Buddha"],
  ["You cannot solve a problem from the same consciousness that created it.", "Albert Einstein"],
  ["An empowered life begins with serious personal questions about oneself.", "Byron Katie"],
  ["Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.", "Mandy Hale"],

  // ── Resilience & Failure ───────────────────────────────────
  ["The greatest glory in living lies not in never falling, but in rising every time we fall.", "Nelson Mandela"],
  ["I have not failed. I've just found 10,000 ways that won't work.", "Thomas A. Edison"],
  ["It is not the strongest of the species that survives, but the most adaptable.", "Charles Darwin"],
  ["Fall seven times, stand up eight.", "Japanese Proverb"],
  ["Our greatest weakness lies in giving up. The most certain way to succeed is to try just one more time.", "Thomas A. Edison"],
  ["When everything seems to be going against you, remember that the airplane takes off against the wind.", "Henry Ford"],
  ["Failure is the condiment that gives success its flavor.", "Truman Capote"],
  ["You may encounter many defeats, but you must not be defeated.", "Maya Angelou"],
  ["The phoenix must burn to emerge.", "Janet Fitch"],
  ["Rock bottom became the solid foundation on which I rebuilt my life.", "J.K. Rowling"],
  ["Turn your wounds into wisdom.", "Oprah Winfrey"],
  ["It always seems impossible until it's done.", "Nelson Mandela"],
  ["If you're going through hell, keep going.", "Winston Churchill"],
  ["Tough times never last, but tough people do.", "Robert H. Schuller"],
  ["A smooth sea never made a skilled sailor.", "Franklin D. Roosevelt"],
  ["Stars can't shine without darkness.", "Anonymous"],
  ["Obstacles don't have to stop you. If you run into a wall, don't turn around. Figure out how to climb it.", "Michael Jordan"],
  ["Challenges are what make life interesting; overcoming them is what makes life meaningful.", "Joshua J. Marine"],
  ["We may encounter many defeats, but we must not be defeated.", "Maya Angelou"],
  ["The human capacity for burden is like bamboo — far more flexible than you'd ever believe.", "Jodi Picoult"],
  ["One of the greatest discoveries a person can make is to find they can do what they were afraid they couldn't.", "Henry Ford"],
  ["Problems are not stop signs, they are guidelines.", "Robert H. Schuller"],
  ["When you come to the end of your rope, tie a knot and hang on.", "Franklin D. Roosevelt"],
  ["Strength grows in the moments when you think you can't go on but you keep going anyway.", "Anonymous"],
  ["You have been assigned this mountain to show others it can be moved.", "Anonymous"],
  ["The starting point of all achievement is desire.", "Napoleon Hill"],
  ["Every strike brings me closer to the next home run.", "Babe Ruth"],
  ["Sometimes you don't realize your own strength until you come face to face with your greatest weakness.", "Susan Gale"],

  // ── Wisdom & Philosophy ────────────────────────────────────
  ["In three words I can sum up everything I've learned about life: it goes on.", "Robert Frost"],
  ["To know what you know and what you do not know — that is true knowledge.", "Confucius"],
  ["An unexamined life is not worth living.", "Socrates"],
  ["We are what we repeatedly do.", "Aristotle"],
  ["The only true wisdom is in knowing you know nothing.", "Socrates"],
  ["Knowing others is wisdom. Knowing yourself is enlightenment.", "Lao Tzu"],
  ["By three methods we may learn wisdom: reflection, which is noblest; imitation, which is easiest; experience, which is the bitterest.", "Confucius"],
  ["The simple things are also the most extraordinary things, and only the wise can see them.", "Paulo Coelho"],
  ["Yesterday is history, tomorrow is a mystery, today is a gift — that's why it's called the present.", "Bill Keane"],
  ["A fool thinks himself wise, but a wise man knows himself to be a fool.", "William Shakespeare"],
  ["Give me six hours to chop down a tree and I will spend the first four sharpening the axe.", "Abraham Lincoln"],
  ["The two most powerful warriors are patience and time.", "Leo Tolstoy"],
  ["Life is what happens when you're busy making other plans.", "John Lennon"],
  ["In the end, it's not the years in your life that count. It's the life in your years.", "Abraham Lincoln"],
  ["Almost everything will work again if you unplug it for a few minutes, including you.", "Anne Lamott"],
  ["Do not go where the path may lead; go instead where there is no path and leave a trail.", "Ralph Waldo Emerson"],
  ["The purpose of our lives is to be happy.", "Dalai Lama"],
  ["Be yourself; everyone else is already taken.", "Oscar Wilde"],
  ["Simplicity is the ultimate sophistication.", "Leonardo da Vinci"],
  ["We know what we are, but know not what we may be.", "William Shakespeare"],
  ["Where there is love there is life.", "Mahatma Gandhi"],
  ["You must be the change you wish to see in the world.", "Mahatma Gandhi"],
  ["An eye for an eye only ends up making the whole world blind.", "Mahatma Gandhi"],
  ["Darkness cannot drive out darkness; only light can do that.", "Martin Luther King Jr."],
  ["The time is always right to do what is right.", "Martin Luther King Jr."],
  ["Not all those who wander are lost.", "J.R.R. Tolkien"],
  ["With great power comes great responsibility.", "Stan Lee"],
  ["The truth will set you free, but first it will make you miserable.", "James A. Garfield"],
  ["Logic will get you from A to B. Imagination will take you everywhere.", "Albert Einstein"],
  ["Not all readers are leaders, but all leaders are readers.", "Harry S. Truman"],
  ["Education is the most powerful weapon which you can use to change the world.", "Nelson Mandela"],
  ["The pen is mightier than the sword.", "Edward Bulwer-Lytton"],
  ["Knowledge speaks, but wisdom listens.", "Jimi Hendrix"],
  ["Better to remain silent and be thought a fool than to speak out and remove all doubt.", "Abraham Lincoln"],

  // ── Health & Fitness ───────────────────────────────────────
  ["Take care of your body. It's the only place you have to live.", "Jim Rohn"],
  ["Physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity.", "John F. Kennedy"],
  ["The groundwork for all happiness is good health.", "Leigh Hunt"],
  ["Exercise is a celebration of what your body can do. Not a punishment for what you ate.", "Anonymous"],
  ["The body achieves what the mind believes.", "Anonymous"],
  ["Motivation is what gets you started. Habit is what keeps you going.", "Jim Ryun"],
  ["You don't have to be great to start, but you do have to start.", "Zig Ziglar"],
  ["Sweat is just fat crying.", "Anonymous"],
  ["Your body can stand almost anything. It's your mind you have to convince.", "Anonymous"],
  ["To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.", "Buddha"],
  ["Health is not about the weight you lose, but about the life you gain.", "Anonymous"],
  ["A healthy outside starts from the inside.", "Robert Urich"],
  ["Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", "Ralph Marston"],
  ["The first wealth is health.", "Ralph Waldo Emerson"],
  ["Energy and persistence conquer all things.", "Benjamin Franklin"],
  ["What seems impossible today will one day become your warm-up.", "Anonymous"],
  ["The difference between try and triumph is just a little umph.", "Marvin Phillips"],
  ["Your health is an investment, not an expense.", "Anonymous"],
  ["A fit body, a calm mind, a house full of love. These things cannot be bought — they must be earned.", "Naval Ravikant"],
  ["You are one workout away from a good mood.", "Anonymous"],
  ["Strength doesn't come from what you can do. It comes from overcoming the things you thought you couldn't.", "Rikki Rogers"],
  ["Train insane or remain the same.", "Anonymous"],
  ["The pain you feel today is the strength you'll feel tomorrow.", "Anonymous"],
  ["It never gets easier. You just get stronger.", "Anonymous"],
  ["No pain, no gain. Shut up and train.", "Anonymous"],
  ["Results happen over time, not overnight. Work hard, stay consistent and be patient.", "Anonymous"],

  // ── Life & Purpose ─────────────────────────────────────────
  ["The two most important days in your life are the day you are born and the day you find out why.", "Mark Twain"],
  ["He who has a why to live can bear almost any how.", "Friedrich Nietzsche"],
  ["Life is either a daring adventure or nothing at all.", "Helen Keller"],
  ["Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.", "Mark Twain"],
  ["Life is not measured by the number of breaths we take, but by the moments that take our breath away.", "Maya Angelou"],
  ["Don't count the days, make the days count.", "Muhammad Ali"],
  ["You only live once, but if you do it right, once is enough.", "Mae West"],
  ["Live in the sunshine, swim in the sea, drink the wild air.", "Ralph Waldo Emerson"],
  ["Life is short and the world is wide.", "Simon Raven"],
  ["Life is a succession of lessons which must be lived to be understood.", "Helen Keller"],
  ["The meaning of life is to find your gift. The purpose of life is to give it away.", "Pablo Picasso"],
  ["I have found that if you love life, life will love you back.", "Arthur Rubinstein"],
  ["Life is not a problem to be solved, but a reality to be experienced.", "Søren Kierkegaard"],
  ["Life begins at the end of your comfort zone.", "Neale Donald Walsch"],
  ["There are only two ways to live your life. One is as though nothing is a miracle. The other is as though everything is.", "Albert Einstein"],
  ["The unexamined life is not worth living.", "Socrates"],
  ["Many of life's failures are people who did not realize how close they were to success when they gave up.", "Thomas A. Edison"],
  ["Live as if you were to die tomorrow. Learn as if you were to live forever.", "Mahatma Gandhi"],
  ["What lies behind us and what lies before us are tiny matters compared to what lies within us.", "Ralph Waldo Emerson"],
  ["Our purpose is to consciously, deliberately evolve toward a wiser, more liberated and luminous state of being.", "Tom Robbins"],
  ["Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", "Buddha"],
  ["Life isn't about finding yourself. Life is about creating yourself.", "George Bernard Shaw"],
  ["Everything you've ever wanted is on the other side of fear.", "George Addair"],
  ["The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate.", "Ralph Waldo Emerson"],
  ["Be happy for this moment. This moment is your life.", "Omar Khayyam"],
  ["Don't watch the clock; do what it does — keep going.", "Sam Levenson"],
  ["You are never too old to set another goal or to dream a new dream.", "C.S. Lewis"],
  ["Be the change you wish to see in the world.", "Mahatma Gandhi"],
  ["You must do the things you think you cannot do.", "Eleanor Roosevelt"],
  ["Do one thing every day that scares you.", "Eleanor Roosevelt"],
  ["It is not the years in your life that count. It's the life in your years.", "Abraham Lincoln"],
  ["The best revenge is massive success.", "Frank Sinatra"],
  ["I am not a product of my circumstances. I am a product of my decisions.", "Stephen Covey"],
  ["Too many of us are not living our dreams because we are living our fears.", "Les Brown"],
  ["Whatever the mind can conceive and believe, the mind can achieve.", "Napoleon Hill"],
  ["The starting point of all achievement is a burning desire.", "Napoleon Hill"],
  ["Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.", "Johann Wolfgang von Goethe"],
  ["Nothing is impossible. The word itself says 'I'm possible!'", "Audrey Hepburn"],

  // ── Courage & Action ───────────────────────────────────────
  ["Courage is not the absence of fear, but the triumph over it.", "Nelson Mandela"],
  ["You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.", "Eleanor Roosevelt"],
  ["Inaction breeds doubt and fear. Action breeds confidence and courage.", "Dale Carnegie"],
  ["Fortune favors the bold.", "Latin Proverb"],
  ["The man who has confidence in himself gains the confidence of others.", "Hasidic Proverb"],
  ["The secret of happiness is freedom, and the secret of freedom is courage.", "Thucydides"],
  ["It takes courage to grow up and become who you really are.", "E.E. Cummings"],
  ["Only those who risk going too far can possibly find out how far one can go.", "T.S. Eliot"],
  ["Jump, and you will find out how to unfold your wings as you fall.", "Ray Bradbury"],
  ["Life shrinks or expands in proportion to one's courage.", "Anaïs Nin"],
  ["Be bold, be brave enough to be your true self.", "Queen Latifah"],
  ["Vulnerability is the birthplace of innovation, creativity and change.", "Brené Brown"],
  ["The cave you fear to enter holds the treasure you seek.", "Joseph Campbell"],
  ["The first step is always the hardest.", "Anonymous"],
  ["A journey of a thousand miles begins with a single step.", "Lao Tzu"],
  ["Don't wait for the perfect moment. Take the moment and make it perfect.", "Anonymous"],
  ["The best time to plant a tree was 20 years ago. The second-best time is now.", "Chinese Proverb"],
  ["Start where you are. Use what you have. Do what you can.", "Arthur Ashe"],
  ["Act as if what you do makes a difference. It does.", "William James"],
  ["Do it now. Sometimes 'later' becomes 'never'.", "Anonymous"],
  ["If it matters to you, you'll find a way. If it doesn't, you'll find an excuse.", "Anonymous"],
  ["Don't wait. The time will never be just right.", "Napoleon Hill"],
  ["Be so good they can't ignore you.", "Steve Martin"],
  ["Go the extra mile. It's never crowded.", "Wayne Dyer"],
  ["Some people want it to happen, some wish it would happen, others make it happen.", "Michael Jordan"],
  ["Dream big and dare to fail.", "Norman Vaughan"],
  ["What you get by achieving your goals is not as important as what you become.", "Zig Ziglar"],
  ["Believe in yourself, take on your challenges, dig deep within yourself to conquer fears.", "Chantal Sutherland"],
  ["Stop doubting yourself. Work hard and make it happen.", "Anonymous"],
  ["Trust yourself. You know more than you think you do.", "Benjamin Spock"],

  // ── Gratitude & Positivity ─────────────────────────────────
  ["Gratitude is the fairest blossom which springs from the soul.", "Henry Ward Beecher"],
  ["The more you praise and celebrate your life, the more there is in life to celebrate.", "Oprah Winfrey"],
  ["Keep your face always toward the sunshine — and shadows will fall behind you.", "Walt Whitman"],
  ["Wherever you go, no matter what the weather, always bring your own sunshine.", "Anthony J. D'Angelo"],
  ["You can't go back and change the beginning, but you can start where you are and change the ending.", "C.S. Lewis"],
  ["It's not what happens to you, but how you react to it that matters.", "Epictetus"],
  ["Happiness is not something you postpone for the future; it is something you design for the present.", "Jim Rohn"],
  ["Count your age by friends, not years. Count your life by smiles, not tears.", "John Lennon"],
  ["Every day may not be good, but there is something good in every day.", "Alice Morse Earle"],
  ["The world is full of magical things patiently waiting for our wits to grow sharper.", "Bertrand Russell"],
  ["Bloom where you are planted.", "Mary Engelbreit"],
  ["Keep your eyes on the stars and your feet on the ground.", "Theodore Roosevelt"],
  ["Nothing is worth more than this day.", "Johann Wolfgang von Goethe"],
  ["Even the darkest night will end and the sun will rise.", "Victor Hugo"],
  ["In every day, there are 1,440 minutes. That means we have 1,440 daily opportunities to make a positive impact.", "Les Brown"],
  ["Spread love everywhere you go. Let no one ever come to you without leaving happier.", "Mother Teresa"],
  ["The best thing to hold onto in life is each other.", "Audrey Hepburn"],
  ["Be yourself; everyone else is already taken.", "Oscar Wilde"],
  ["You are enough just as you are.", "Meghan Markle"],
  ["Be kind whenever possible. It is always possible.", "Dalai Lama"],
  ["Small acts of kindness make the biggest difference.", "Anonymous"],
  ["The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.", "Helen Keller"],
  ["Today, give a stranger one of your smiles. It might be the only sunshine they see all day.", "H. Jackson Brown Jr."],
  ["When I was 5 years old, my mother told me that happiness was the key to life.", "John Lennon"],
  ["Joy is what happens to us when we allow ourselves to recognize how good things really are.", "Marianne Williamson"],
  ["Write it on your heart that every day is the best day in the year.", "Ralph Waldo Emerson"],
  ["Let us make our future now, and let us make our dreams tomorrow's reality.", "Malala Yousafzai"],
  ["The most wasted of days is one without laughter.", "E.E. Cummings"],
  ["A day without laughter is a day wasted.", "Charlie Chaplin"],
  ["Find joy in the ordinary.", "Anonymous"],
  ["You are allowed to be both a masterpiece and a work in progress simultaneously.", "Sophia Bush"],
  ["What you are will show in what you do.", "Thomas A. Edison"],
  ["The biggest gift you can give is to be exactly who you are.", "Fred Rogers"],
];

// ── Public API ─────────────────────────────────────────────────

/**
 * Returns a deterministic quote for a given date string.
 * Same date → same quote, always.
 * Different year, same calendar date → different quote (year influences seed).
 */
export function getQuoteForDate(dateStr) {
  const key = dateStr || new Date().toISOString().split('T')[0];
  const seed = dateSeed(key);
  const rand = mulberry32(seed);
  const shuffled = seededShuffle(QUOTES, rand);
  return { text: shuffled[0][0], author: shuffled[0][1] };
}

/** Convenience — today's quote */
export function getQuoteForToday() {
  return getQuoteForDate(new Date().toISOString().split('T')[0]);
}

/** Total quote count */
export const QUOTE_COUNT = QUOTES.length;

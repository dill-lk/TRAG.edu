
import { Grade, Subject, Resource, ExamCategory } from './types';

export const GRADES: Grade[] = [
  { id: 'al', name: 'G.C.E. Advanced Level', sinhalaName: 'අ.පො.ස. උසස් පෙළ (A/L)', colorFrom: 'from-blue-600', colorTo: 'to-indigo-600' },
  { id: 'ol', name: 'G.C.E. Ordinary Level', sinhalaName: 'අ.පො.ස. සාමාන්‍ය පෙළ (O/L)', colorFrom: 'from-emerald-600', colorTo: 'to-teal-600' },
  { id: 'gr11', name: 'Grade 11', sinhalaName: '11 ශ්‍රේණිය', colorFrom: 'from-teal-600', colorTo: 'to-teal-800' },
  { id: 'gr10', name: 'Grade 10', sinhalaName: '10 ශ්‍රේණිය', colorFrom: 'from-teal-500', colorTo: 'to-teal-700' },
  { id: 'gr9', name: 'Grade 9', sinhalaName: '9 ශ්‍රේණිය', colorFrom: 'from-indigo-600', colorTo: 'to-indigo-800' },
  { id: 'gr8', name: 'Grade 8', sinhalaName: '8 ශ්‍රේණිය', colorFrom: 'from-indigo-500', colorTo: 'to-indigo-700' },
  { id: 'gr7', name: 'Grade 7', sinhalaName: '7 ශ්‍රේණිය', colorFrom: 'from-orange-600', colorTo: 'to-red-600' },
  { id: 'gr6', name: 'Grade 6', sinhalaName: '6 ශ්‍රේණිය', colorFrom: 'from-blue-700', colorTo: 'to-blue-900' },
];

export const EXAM_CATEGORIES = [
  { id: 'al', name: 'G.C.E. Advanced Level' },
  { id: 'ol', name: 'G.C.E. Ordinary Level' },
  { id: 'gr5', name: 'Grade 5 Scholarship' },
  { id: 'other', name: 'Other Grades' }
];

const mkSub = (id: string, name: string, sinhala: string, tamil: string, group: string, prefix: string): Subject => ({
  id: `${prefix}-${id}`, 
  name, 
  sinhalaName: sinhala, 
  tamilName: tamil,
  group
});

export const SUBJECTS_6_TO_9: Subject[] = [
  // 📘 Main Subjects
  mkSub('maths', 'Mathematics', 'ගණිතය', 'கணிதம்', '📘 Main Subjects', 'jnr'),
  mkSub('sci', 'Science', 'විද්‍යාව', 'அறிவியல்', '📘 Main Subjects', 'jnr'),
  mkSub('hist', 'History', 'ඉතිහාසය', 'வரலாறு', '📘 Main Subjects', 'jnr'),
  mkSub('eng', 'English Language', 'ඉංග්‍රීසි භාෂාව', 'ஆங்கில மொழி', '📘 Main Subjects', 'jnr'),
  
  // 🙏 Religion
  mkSub('bud', 'Buddhism', 'බුද්ධ ධර්මය', 'பௌத்தம்', '🙏 Religion', 'jnr'),
  mkSub('cath', 'Catholicism', 'කතෝලික ධර්මය', 'கத்தோலிக்கம்', '🙏 Religion', 'jnr'),
  mkSub('chri', 'Christianity', 'ක්‍රිස්තියානි ධර්මය', 'கிறிஸ்தவம்', '🙏 Religion', 'jnr'),
  mkSub('isla', 'Islam', 'ඉස්ලාම්', 'இஸ்லாம்', '🙏 Religion', 'jnr'),
  
  // 📙 Language & Literature
  mkSub('sinh-lit', 'Sinhala Language & Literature', 'සිංහල භාෂාව හා සාහිත්‍ය‍ය', '', '📙 Language & Literature', 'jnr'),
  mkSub('tam-lit', 'Tamil Language & Literature', 'දෙමළ භාෂාව හා සාහිත්‍ය‍ය', '', '📙 Language & Literature', 'jnr'),
  
  // 📝 Category I
  mkSub('geo', 'Geography', 'භූගෝල විද්‍යාව', 'புவியியல்', '📝 Category I', 'jnr'),
  mkSub('civic', 'Civic Education', 'පුරවැසි අධ්‍යාපනය', 'குடிமை கல்வி', '📝 Category I', 'jnr'),
  mkSub('sl-sinh', 'Second Language (Sinhala)', 'දෙවන භාෂාව (සිංහල)', '', '📝 Category I', 'jnr'),
  mkSub('sl-tam', 'Second Language (Tamil)', 'දෙවන භාෂාව (දෙමළ)', '', '📝 Category I', 'jnr'),
  
  // 📝 Category II
  mkSub('mus-ori', 'Music(Oriental)', 'සංගීතය(පෙරදිග)', '', '📝 Category II', 'jnr'),
  mkSub('mus-wes', 'Music(Western)', 'සංගීතය(අපරදිග)', '', '📝 Category II', 'jnr'),
  mkSub('art', 'Art', 'චිත්‍ර', 'கலை', '📝 Category II', 'jnr'),
  mkSub('dan-ori', 'Dancing(Oriental)', 'නැටුම්(දේශීය)', '', '📝 Category II', 'jnr'),
  mkSub('drama', 'Drama', 'නාට්‍ය හා රංග කලාව', '', '📝 Category II', 'jnr'),
  
  // 📝 Category III
  mkSub('ict', 'ICT', 'තොරතුරු හා සන්නිවේදන තාක්ෂණය', '', '📝 Category III', 'jnr'),
  mkSub('health', 'Health', 'සෞඛ්‍ය', 'ஆரோக்கியம்', '📝 Category III', 'jnr'),
  mkSub('pts', 'PTS', 'ප්‍රායෝගික හා තාක්ෂණික කුසලතා', '', '📝 Category III', 'jnr'),
];

export const SUBJECTS_10_TO_11: Subject[] = [
  // 📘 Main Subjects
  mkSub('maths', 'Mathematics', 'ගණිතය', 'கணிதம்', '📘 Main Subjects', 'snr'),
  mkSub('sci', 'Science', 'විද්‍යාව', 'அறிவியல்', '📘 Main Subjects', 'snr'),
  mkSub('hist', 'History', 'ඉතිහාසය', 'வரலாறு', '📘 Main Subjects', 'snr'),
  mkSub('eng', 'English Language', 'ඉංග්‍රීසි භාෂාව', 'ஆங்கில மொழி', '📘 Main Subjects', 'snr'),
  
  // 🙏 Religion
  mkSub('bud', 'Buddhism', 'බුද්ධ ධර්මය', 'பௌத்தம்', '🙏 Religion', 'snr'),
  mkSub('cath', 'Catholicism', 'කතෝලික ධර්මය', 'கத்தோலிக்கம்', '🙏 Religion', 'snr'),
  mkSub('chri', 'Christianity', 'ක්‍රිස්තියානි ධර්මය', 'கிறிஸ்தவம்', '🙏 Religion', 'snr'),
  mkSub('isla', 'Islam', 'ඉස්ලාම්', 'இஸ்லாம்', '🙏 Religion', 'snr'),
  
  // 📙 Language & Literature
  mkSub('sinh-lit', 'Sinhala Language & Literature', 'සිංහල භාෂාව හා සාහිත්‍ය‍ය', '', '📙 Language & Literature', 'snr'),
  mkSub('tam-lit', 'Tamil Language & Literature', 'දෙමළ භාෂාව හා සාහිත්‍ය‍ය', '', '📙 Language & Literature', 'snr'),
  
  // 📝 Category I
  mkSub('bus', 'Business Studies', 'ව්‍යාපාර අධ්‍යයනය', 'வணிக ஆய்வுகள்', '📝 Category I', 'snr'),
  mkSub('geo', 'Geography', 'භූගෝල විද්‍යාව', 'புவியியல்', '📝 Category I', 'snr'),
  mkSub('civic', 'Civic Education', 'පුරවැසි අධ්‍යාපනය', 'குடிமை கல்வி', '📝 Category I', 'snr'),
  mkSub('entre', 'Entrepreneurship Studies', 'ව්‍යවසායකත්ව අධ්‍යයනය', '', '📝 Category I', 'snr'),
  mkSub('sl-sinh', 'Second Language (Sinhala)', 'දෙවන භාෂාව (සිංහල)', '', '📝 Category I', 'snr'),
  mkSub('sl-tam', 'Second Language (Tamil)', 'දෙවන භාෂාව (දෙමළ)', '', '📝 Category I', 'snr'),
  
  // 📝 Category II
  mkSub('mus-ori', 'Music(Oriental)', 'සංගීතය(පෙරදිග)', '', '📝 Category II', 'snr'),
  mkSub('mus-wes', 'Music(Western)', 'සංගීතය(අපරදිග)', '', '📝 Category II', 'snr'),
  mkSub('art', 'Art', 'චිත්‍ර', 'கலை', '📝 Category II', 'snr'),
  mkSub('dan-ori', 'Dancing(Oriental)', 'නැටුම්(දේශීය)', '', '📝 Category II', 'snr'),
  mkSub('drama', 'Drama', 'නාට්‍ය හා රංග කලාව', '', '📝 Category II', 'snr'),
  mkSub('lit-eng', 'English Literature', 'ඉංග්‍රීසි සාහිත්‍ය', '', '📝 Category II', 'snr'),
  mkSub('lit-sinh', 'Sinhala Literature', 'සිංහල සාහිත්‍ය', '', '📝 Category II', 'snr'),
  mkSub('lit-tam', 'Tamil Literature', 'දෙමළ සාහිත්‍ය', '', '📝 Category II', 'snr'),
  
  // 📝 Category III
  mkSub('ict', 'ICT', 'තොරතුරු හා සන්නිවේදන තාක්ෂණය', '', '📝 Category III', 'snr'),
  mkSub('agri', 'Agriculture', 'කෘෂිකර්මය', 'வேளாண்மை', '📝 Category III', 'snr'),
  mkSub('aqua', 'Aquatic Bioresources Tech', 'Aquatic Bioresources Tech', '', '📝 Category III', 'snr'),
  mkSub('craft', 'Art & Crafts', 'ශිල්ප කලා', '', '📝 Category III', 'snr'),
  mkSub('home-eco', 'Home Economics', 'ගෘහ ආර්ථික විද්‍යාව', '', '📝 Category III', 'snr'),
  mkSub('health', 'Health', 'සෞඛ්‍ය', 'ஆரோக்கியம்', '📝 Category III', 'snr'),
  mkSub('media', 'Media Studies', 'මාධ්‍ය අධ්‍ය‍යනය', '', '📝 Category III', 'snr'),
  mkSub('const', 'Construction Tech', 'ඉදිකිරීම් තාක්ෂණවේදය', '', '📝 Category III', 'snr'),
  mkSub('mech', 'Mechanical Tech', 'යාන්ත්‍රික තාක්ෂණවේදය', '', '📝 Category III', 'snr'),
  mkSub('elec', 'Electronic Tech', 'ඉලෙක්ට්‍රොනික තාක්ෂණවේදය', '', '📝 Category III', 'snr'),
];

export const SUBJECTS_AL: Subject[] = [
  mkSub('com-maths', 'Combined Mathematics', 'සංයුක්ත ගණිතය', 'සංයුක්ත ගණිතය', '🧪 Physical Science', 'al'),
  mkSub('physics', 'Physics', 'භෞතික විද්‍යාව', 'භෞතික විද්‍යාව', '🧪 Physical Science', 'al'),
  mkSub('chem', 'Chemistry', 'රසායන විද්‍යාව', 'රසායන විද්‍යාව', '🧪 Physical Science', 'al'),
  mkSub('bio', 'Biology', 'ජීව විද්‍යාව', 'ජීව විද්‍යාව', '🧬 Biological Science', 'al'),
  mkSub('ict', 'ICT', 'තොරතුරු තාක්ෂණය', 'තොරතුරු තාක්ෂණය', '💻 Technology', 'al'),
  mkSub('econ', 'Economics', 'ආර්ථික විද්‍යාව', '', '📈 Commerce', 'al'),
  mkSub('acc', 'Accounting', 'ගිණුම්කරණය', '', '📈 Commerce', 'al'),
  mkSub('bs', 'Business Studies', 'ව්‍යාපාර අධ්‍යයනය', '', '📈 Commerce', 'al'),
];

export const SUBJECTS: Subject[] = [...SUBJECTS_6_TO_9, ...SUBJECTS_10_TO_11, ...SUBJECTS_AL];

export const NAV_LINKS = [
  { name: 'Home', sinhala: 'ප්‍රධාන පිටුව', href: '#/' },
  { name: 'A/L Archive', sinhala: 'උසස් පෙළ', href: '#/grade/al' },
  { name: 'O/L Archive', sinhala: 'සාමාන්්‍ය පෙළ', href: '#/grade/ol' },
];

export const RESOURCES: Resource[] = [];

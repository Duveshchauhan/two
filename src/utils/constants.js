const enableQuickReply = true
const quickReplies = ['Let me take a look.', 'Let me check.', 'One moment, please.']
const regexBosch = /\b((?:hey|Hey|bosch|Bosch|boss|Boss)\s*,?\s*(?:bo[sf]ch|bosh|wash|bash|bush|boss|batch|bats|baas|botch))\b\s*,?\s*(.*)/i;
const regexBro = /(hey\s+b[or]o[seg]?)[,\s]+(.*)/i;

const TTSVOICE = "en-IN-NeerjaNeural"
const faqs = [
    {
        question: "What are the timings morning shift and what are the allowances",
        answer: "The timings of the morning shift are 5:30 am to 3:00 pm. The allowance for the morning shift is Rs. 250 per day.",
    },
    {
        question: "What is leave bank?",
        answer: "Leave Bank refers to a program where eligible associates can contribute their unused earned leave to be used by associates recovering from critical illness.",
    },
    {
        question: "What is Shakti?",
        answer: "Shakti is a welfare trust established to provide financial assistance to associates during medical emergencies.",
    },
    {
        question: "How can I cancel festival leave?",
        answer: "Login to ESS > HR > My working time > Leave request > Apply or Cancel Leave > Select leave type as Festival Holiday > Cancel the holiday before the actual festival date.",
    },
    {
        question: "How many total festival holidays are there",
        answer: "There are 10 festival holidays in a calendar year, with some holidays predefined by BGSW and the remaining chosen by associates from a declared list.",
    }
]
export { quickReplies, enableQuickReply, regexBosch, TTSVOICE, faqs, regexBro }
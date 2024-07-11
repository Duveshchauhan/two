"use client"
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { soundex } from 'soundex-code'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { faMicrophone, faMicrophoneSlash, faPaperPlane, faPersonCircleQuestion, faPlus, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TTSVOICE, enableQuickReply, faqs, quickReplies, regexBosch } from '@/utils/constants';
import { useConfig } from '@/utils/config';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Cookies from "universal-cookie"
export default function Home() {

  //get the configuration function
  const { initializeServices } = useConfig()

  //define a regex for extracting the link
  const linkRegex = /https?:\/\/[^\s.]+(?:\.[^\s.]+)*(?!\.)/g;

  //declare the states
  const [startMicrophoneButton, setStartMicrophoneButton] = useState(true)
  const [messages, setMessages] = useState([])
  const [query, setQuery] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(true)
  const chatHistoryContainer = useRef(null)
  const [initialized, setInitialized] = useState(false)
  const [speechServices, setSpeechServices] = useState({
    speechSynthesizer: null,
    speechRecognizer: null
  })

  const [FAQOpen, setFAQOpen] = useState(0)
  let isTextInput = false

  //references
  const sideRef = useRef(null)

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const cookies = new Cookies();
    const user = cookies.get("user");
    setUserData(user);

    //Initialize speech services
    const startSession = () => {
      setLoading(true)
      initializeServices().then(({ SpeechSynthesizer, SpeechRecognizer }) => {
        speechServices.speechRecognizer = SpeechRecognizer
        speechServices.speechSynthesizer = SpeechSynthesizer
        setInitialized(true)
        setLoading(false)
      }).catch((err) => {
        alert(err)
        setLoading(false)
      })
    }

    startSession()
    //eslint-disable-next-line
  }, [])

  const removeStringsInBrackets = (str) => {
    return str.replace(/\([^)]*\)/g, ''); // Regular expression to remove strings enclosed in brackets
  };

  const getAnswer = (userQuery) => {
    setQuery('')
    const chat = {
      role: "user",
      content: userQuery
    }
    messages.push(chat)
    if (messages.length > 9) {
      messages.shift()
    }
    let chatHistory = chatHistoryContainer.current
    var questionContainer = document.createElement('div')
    questionContainer.className = "question-container"
    var newSpan = document.createElement('span')
    var content = document.createTextNode(userQuery)
    newSpan.appendChild(content)
    newSpan.className = "by-human p-3 rounded-lg"
    questionContainer.appendChild(newSpan)
    var questionIcon = document.createElement('img')
    questionIcon.src = `/user.gif`
    questionIcon.alt = ""
    questionIcon.className = "question-icon"
    questionContainer.appendChild(questionIcon)
    chatHistory.appendChild(questionContainer)
    chatHistory.scrollTop = chatHistory.scrollHeight

    if (!isTextInput) {
      if (enableQuickReply) {
        const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-IN'><voice name='${TTSVOICE}'><mstts:leadingsilence-exact value='0'/> <prosody rate="0.00%">${htmlEncode(quickReplies[Math.floor(Math.random() * quickReplies.length)])}</prosody><break time='0ms' /></voice></speak>`
        speechServices.speechSynthesizer.speakSsmlAsync(ssml, (result) => {
        })
      }
    }

    return new Promise((resolve, reject) => {

      axios.post(`${process.env.BASE_URL}/chat`, {
        question: messages
      }, {
        headers: {
          'X-User-ID': userData.accountname
        }
      }).then((response) => {
        const links = response.data.answer.match(linkRegex);
        const assistantReply = response.data.answer.replace(linkRegex, '')
        const source = response.data.source
        const answer_id = response.data.answer_id
        const answer = {
          role: "assistant",
          content: assistantReply
        }
        messages.push(answer)
        if (messages.length > 9) {
          messages.shift()
        }
        resolve({ assistantReply, source, answer_id, links })
      })
    })
  }

  function htmlEncode(text) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };

    return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match])
  }

  const speak = (text, source, answer_id, links, endingSilence = 0) => {
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-IN'><voice name='${TTSVOICE}'><mstts:leadingsilence-exact value='0'/> <prosody rate="0.00%">${htmlEncode(text)}</prosody><break time='${endingSilence}ms' /></voice></speak>`

    setIsSpeaking(true)
    if (isTextInput) {
      const chatHistory = chatHistoryContainer.current;
      var responseContainer = document.createElement('div');
      responseContainer.className = "response-container";
      var chatIcon = document.createElement('img');
      chatIcon.src = `/chaticon.gif`;
      chatIcon.alt = "";
      chatIcon.className = "chat-icon";
      responseContainer.appendChild(chatIcon);

      var newDiv = document.createElement('div');
      var newSpan = document.createElement('span');
      newDiv.appendChild(newSpan);

      newDiv.className = "by-ai p-3 rounded-lg text-justify";
      responseContainer.appendChild(newDiv);
      chatHistory.appendChild(responseContainer);

      function typeText(element, text, typingSpeed, callback) {
        let currentIndex = 0;

        function typeCharacter() {
          if (currentIndex < text.length) {
            if (text[currentIndex] === '\n') {
              element.appendChild(document.createElement('br'));
            } else {
              element.appendChild(document.createTextNode(text[currentIndex]));
            }
            currentIndex++;
            requestAnimationFrame(() => {
              chatHistory.scrollTop = chatHistory.scrollHeight;
            });
          } else {
            clearInterval(intervalId);
            if (callback) callback();
          }
        }

        let intervalId = setInterval(typeCharacter, typingSpeed);
      }

      typeText(newSpan, text, 35, () => {
        if (links && links.length > 0) {
          links.forEach(element => {
            var a = document.createElement('a');
            a.target = "_blank";
            a.href = element;
            a.innerText = element;
            newDiv.append(a);
          });
        }
        if (source) {
          const sourceSpan = document.createElement('span')
          sourceSpan.appendChild(document.createTextNode("Source: " + source))
          sourceSpan.className = "font-sm font-medium"
          newDiv.append(sourceSpan)
        }

        const feedbackContainer = document.createElement('div')
        feedbackContainer.className = "flex gap-4 items-center justify-end"

        const likeButton = document.createElement('button')
        const dislikeButton = document.createElement('button')
        likeButton.className = "feedbackButtonLike"
        dislikeButton.className = "feedbackButtonDislike"
        likeButton.innerHTML = "👍"
        dislikeButton.innerHTML = "👎"
        likeButton.id = `${answer_id}_like`
        dislikeButton.id = `${answer_id}_dislike`

        likeButton.onclick = () => handleFeedback(answer_id, "Liked")
        dislikeButton.onclick = () => handleFeedback(answer_id, "Disliked")
        feedbackContainer.appendChild(likeButton)
        feedbackContainer.appendChild(dislikeButton)

        newDiv.appendChild(feedbackContainer)

        chatHistory.scrollTop = chatHistory.scrollHeight;
      });
    } else if (!isTextInput) {
      speechServices.speechSynthesizer.speakSsmlAsync(ssml, (result) => {
        const chatHistory = chatHistoryContainer.current;
        var responseContainer = document.createElement('div');
        responseContainer.className = "response-container";
        var chatIcon = document.createElement('img');
        chatIcon.src = `/chaticon.gif`;
        chatIcon.alt = "";
        chatIcon.className = "chat-icon";
        responseContainer.appendChild(chatIcon);

        var newDiv = document.createElement('div');
        var newSpan = document.createElement('span');
        newDiv.appendChild(newSpan);

        newDiv.className = "by-ai p-3 rounded-lg text-justify";
        responseContainer.appendChild(newDiv);
        chatHistory.appendChild(responseContainer);

        function typeText(element, text, typingSpeed, callback) {
          let currentIndex = 0;

          function typeCharacter() {
            if (currentIndex < text.length) {
              if (text[currentIndex] === '\n') {
                element.appendChild(document.createElement('br'));
              } else {
                element.appendChild(document.createTextNode(text[currentIndex]));
              }
              currentIndex++;
              requestAnimationFrame(() => {
                chatHistory.scrollTop = chatHistory.scrollHeight;
              });
            } else {
              clearInterval(intervalId);
              if (callback) callback();
            }
          }

          let intervalId = setInterval(typeCharacter, typingSpeed);
        }

        typeText(newSpan, text, 35, () => {
          if (links && links.length > 0) {
            links.forEach(element => {
              var a = document.createElement('a');
              a.target = "_blank";
              a.href = element;
              a.innerText = element;
              newDiv.append(a);
            });
          }

          if (source) {
            const sourceSpan = document.createElement('span')
            sourceSpan.appendChild(document.createTextNode("Source: " + source))
            sourceSpan.className = "font-sm font-medium"
            newDiv.append(sourceSpan)
          }
          const feedbackContainer = document.createElement('div')
          feedbackContainer.className = "flex gap-4 items-center justify-end"

          const likeButton = document.createElement('button')
          const dislikeButton = document.createElement('button')
          likeButton.className = "feedbackButtonLike"
          dislikeButton.className = "feedbackButtonDislike"
          likeButton.innerHTML = "👍"
          dislikeButton.innerHTML = "👎"
          likeButton.id = `${answer_id}_like`
          dislikeButton.id = `${answer_id}_dislike`

          likeButton.onclick = () => handleFeedback(answer_id, "Liked")
          dislikeButton.onclick = () => handleFeedback(answer_id, "Disliked")
          feedbackContainer.appendChild(likeButton)
          feedbackContainer.appendChild(dislikeButton)

          newDiv.appendChild(feedbackContainer)

          chatHistory.scrollTop = chatHistory.scrollHeight;
        });
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          setIsSpeaking(false)
        }
      })
    }


  }
  const handleFeedback = (answer_id, feedback) => {
    axios.post(`${process.env.BASE_URL}/add-feedback`, {
      answer_id: answer_id,
      feedback: feedback
    }, {
      headers: {
        "X-User-ID": userData.accountname
      }
    }).then((response) => {
      const like = document.getElementById(`${answer_id}_like`)
      like.disabled = true
      const dislike = document.getElementById(`${answer_id}_dislike`)
      dislike.disabled = true
      if (feedback === "Liked") {
        like.style.background = "rgb(47, 133, 90)"
      } else if (feedback === "Disliked") {
        dislike.style.background = "rgb(197, 48, 48)"
      }
    }).catch((error) => {
      alert(error)
    })
  }

  const startMicrophone = () => {
    speechServices.speechRecognizer.recognized = async (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        let userQueryFull = e.result.text.trim()
        const match = userQueryFull.match(regexBosch);
        if (match && (soundex("Hey Bosch") === soundex(match[1])) && match[2]) {
          isTextInput = false
          getAnswer(match[2]).then(({ assistantReply, source, answer_id, links }) => {
            speak(assistantReply, source, answer_id, links)
          })
        }
      }
    }
    speechServices.speechRecognizer.startContinuousRecognitionAsync()
    setStartMicrophoneButton(false)
  }

  const stopMicrophone = () => {
    speechServices.speechRecognizer.stopContinuousRecognitionAsync()
    setStartMicrophoneButton(true)
  }

  const handleInput = () => {
    if (!query) {
      alert("Please provide a question")
      return
    }
    isTextInput = true;
    getAnswer(query).then(({ assistantReply, source, answer_id, links }) => {
      speak(assistantReply, source, answer_id, links)
      setQuery('')
    })
  }

  return (
    <main className="min-h-screen max-h-screen flex flex-col App overflow-hidden">
      <Header />

      <Navbar sideRef={sideRef} />

      <header className="headerRibbon hr-bottom"></header>
      {initialized && (
        <div className="flex flex-1 p-4 md:h-[90vh] gap-6 relative overflow-auto">

          <div className='md:w-[20%] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md border border-gray-100 md:flex flex-col p-4 gap-4 overflow-auto hidden' ref={sideRef}>
            <div className='flex sticky top-0 w-full'>
              <button className='bg-white text-left w-full p-2 rounded-md flex gap-2 items-center' onClick={() => window.location.reload()}>
                <FontAwesomeIcon icon={faPlus} />
                New Chat
              </button>
            </div>
            <span className='text-white p-1.5 rounded text-center bubble-bottom'>Top 5 FAQs</span>
            <div className="flex flex-col gap-4 overflow-auto">
              {faqs.map((item, index) => (
                <button className="flex bg-white p-2 rounded flex-col text-left gap-2 text-white" key={index} onClick={() => setFAQOpen(FAQOpen === index ? null : index)} style={{
                  background: "linear-gradient(to bottom, #2f7eb5, #05a5ca)"
                }}>
                  <div className="flex justify-between w-full gap-3">
                    <span className={`overflow-hidden font-medium ${!(FAQOpen === index) && "whitespace-nowrap"}`}>{item.question}</span>
                    <FontAwesomeIcon icon={faCaretDown} className={`text-lg transition-transform duration-500 ${FAQOpen === index ? 'transform rotate-180' : ''}`} />
                  </div>
                  <div className={`overflow-hidden text-sm ${FAQOpen === index ? "h-full block" : "h-0 hidden"}`}>
                    {item.answer}
                  </div>
                </button>
              ))}
            </div>
          </div>


          <div className='md:w-[80%] w-full border-2 rounded-md border-white p-4 md:px-12 flex flex-col bg-clip-padding backdrop-filter backdrop-blur-md gap-4 relative'>
            <div className="flex flex-col flex-1 gap-4 overflow-auto p-1 scroll-smooth" ref={chatHistoryContainer}>
              <div className="flex flex-col justify-center items-center text-white m-auto">
                <FontAwesomeIcon icon={faPersonCircleQuestion} className="fa fa-person-circle-question text-4xl" />
                <span className='text-[1.8rem] font-medium text-center'>Hi {removeStringsInBrackets(userData.accountname)}! How can I help you today?</span>
                <span className='text-center'>Please use the phrase &ldquo;<span className="font-bold text-[#5aff3e]">Hey Bosch</span>&rdquo; followed by the question.</span>
                <br />
                <span className='text-center'>HR Policies includes: Employee Benefits, Welfare and Administration, Employment Opportunity, Rewards and Recognition, Diversity, Medical and Insurance, Deputation & Travel Management, Hybrid Work</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className='bg-white items-center px-2 rounded-lg p-[0.2rem] focus-within:outline-[#00ffff] focus-within:outline justify-between flex flex-wrap'>
                <input type="text" className='w-full border-none rounded-lg h-8 p-3 outline-none focus:outline-none flex-1' placeholder='Type here.....' onChange={(e) => {
                  setQuery(e.target.value)
                }} value={query} onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleInput()
                  }
                }} />
                <button className='button-87' style={{ padding: '0.6rem' }} disabled={query.length > 3 ? false : true} onClick={() => handleInput()}>
                  <FontAwesomeIcon icon={faPaperPlane} className='text-[1rem]' />
                </button>
              </div>
              <div className="flex justify-between">
                {startMicrophoneButton && (
                  <button className="button-87" disabled={!startMicrophoneButton} onClick={() => startMicrophone()}>
                    <FontAwesomeIcon icon={faMicrophone} />
                    Start Microphone
                  </button>
                )}

                {!startMicrophoneButton && (
                  <button className="button-87" disabled={startMicrophoneButton} onClick={() => stopMicrophone()}>
                    <FontAwesomeIcon icon={faMicrophoneSlash} />
                    Stop Microphone
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && (<Loader />)}
    </main>
  );
}

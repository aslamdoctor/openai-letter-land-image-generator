const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
import { useEffect, useState } from "react";
import OpenAI from "openai";

const Body = () => {
  const [formData, setFormData] = useState({
    alphabet: '',
    category: '',
  });

  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [buttonText, setButtonText] = useState('Generate');
  const [validationError, setValidationError] = useState('');
  const [openai, setOpenAI] = useState(null);

  useEffect(() => {
    const openaiObject = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    setOpenAI(openaiObject);
  }, []);


  const alphabetOptions = Array.from({ length: 26 }, (_, i) => (
    <option key={i} value={String.fromCharCode(65 + i)}>
      {String.fromCharCode(65 + i)}
    </option>
  ));

  const categories = [
    'Animal',
    'Bird',
    'Fruit',
    'Vegetable',
    'Flower',
    'Vehicle',
  ];

  const submitFormData = async (e) => {
    e.target.setAttribute('disabled', 'true');

    if(!formData.alphabet){
      setValidationError('Please select alphabet');
      return;
    }
    if(!formData.category){
      setValidationError('Please select category');
      return;
    }
    setValidationError('');
    await generateName();
  }

  const generateName = async () => {
    setButtonText('Generating Name...');

    const messages =  [
      {
        role: 'system',
        content: 'You are a teacher for kids under age 10 and you have a very good knowledge.'
      },
      {
        role: 'user',
        content: `Generate name of ${formData.category} starting with the letter ${formData.alphabet} from top 10 popular ${formData.category}s. Answer only in single word.`
      }
    ];

    try{
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages
      });

      setName(response.choices[0].message.content);
      generateImage(response.choices[0].message.content);
    } catch(error) {
      setValidationError(`An error occurred while getting name: ${error}`);
    }
  }

  const generateImage = (imageName) => {
    setButtonText('Generating Image...');

    const promptText = `A photorealistic image of the ${formData.category} called ${imageName}.`;
    console.log({promptText});

    openai.images.generate({
      model: 'dall-e-3',
      prompt: promptText,
      size: '1024x1024',
      n: 1,
      style: 'natural',
      response_format: 'b64_json'
    }).then((response) => {
      console.log(response);
      setGeneratedImage(`data:image/png;base64,${response.data[0].b64_json}`);
    }).catch((error) => {
      console.error(error);
    }).finally(()=>{
      setButtonText('Generate');
      setPrompt(promptText);
    });
  }

  const resetForm = () => {
    setValidationError('');
    setFormData({
      alphabet: '',
      category: '',
    })
    setGeneratedImage('')
    setPrompt('')
    setName('')
  }

  return (
    <div className="p-6 bg-[#FFF6E9]">
        <div className="generated-image w-full bg-[#fffdfa] border-2 border-[#fb7634] bg-[#fff7f3] mb-5">
          { generatedImage  && <img src={generatedImage} alt="" /> }
        </div>

        { name && <div className="py-3 w-full bg-[#10a533] text-white text-2xl uppercase font-bold mb-5">{name}</div> }

        <div className="mb-5">
          <select name="alphabet" className="selector text-xl w-full p-3 border-2 border-[#fb7634]"
            disabled={prompt ? true : false }
            value={formData.alphabet}
            onChange={(e) => {
              setFormData({
                ...formData,
                alphabet: e.target.value
              })
            }}>
            <option value="">Select Alphabet</option>
            {alphabetOptions}
          </select>
        </div>

        <div className="mb-5">
          <select name="category" className="selector text-xl w-full p-3 border-2 border-[#fb7634]"
            disabled={prompt ? true : false }
            value={formData.category}
            onChange={(e) => {
              setFormData({
                ...formData,
                category: e.target.value
              })
            }}>
            <option value="">Select Category</option>
            { categories.map( (category, key) => <option key={key} value={category}>{category}</option>) }
          </select>
        </div>

        { validationError && <div className="mb-5 text-sm text-red-600">{validationError}</div>}

        { !prompt &&
        <button className="py-3 w-full bg-[#FF7F3E] hover:bg-[#fb7634] disabled:bg-[#ff915a] disabled:cursor-not-allowed text-white text-2xl uppercase font-bold shadow-slate-400 shadow-sm"
          disabled={prompt ? true : false }
          onClick={(e) => submitFormData(e)}>{buttonText}</button>
        }

        { prompt &&
        <button className="py-3 w-full bg-[#FF7F3E] hover:bg-[#fb7634] text-white text-2xl uppercase font-bold shadow-slate-400 shadow-sm"
          onClick={() => resetForm()}>Start over</button>
        }
    </div>
  )
}

export default Body
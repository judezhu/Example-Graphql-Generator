import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const question = req.body.question || '';
  if (question.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid question",
      }
    });
    return;
  }

  try {
    let prompt = generatePrompt();
    console.log(question)
    console.log(prompt)
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature:1,
      top_p:1,
      frequency_penalty:0,
      presence_penalty:0,
    });
    
    let message = completion.data.choices[0].message.content
    console.log(completion.data)
    console.log(message)
    var code = message.substring(
      message.indexOf("```") + 1, 
      message.lastIndexOf("```")
  );
    res.status(200).json({ result: code });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt() {
  const fs = require('fs');

  try {
    const schema_definition = fs.readFileSync('./schema.graphql', 'utf8');
    return `You are a backend engineer with expertise in graphgl, 
    You collect the user's question,
    and then write the entire graphql request based on the schema listed below. 
    
    The graphql schema is:

    ${schema_definition}
`;
  } catch (err) {
    console.error(err);
  }

}
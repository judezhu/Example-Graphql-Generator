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

  const animal = req.body.animal || '';
  if (animal.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid question",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: generatePrompt(),
      temperature: 0,
      max_tokens: 2000,
    //   top_p:1,
    // frequency_penalty:0,
    // presence_penalty:0,
    stop:["{}"],
    });
    console.log(completion.data)
    res.status(200).json({ result: completion.data.choices[0].text });
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
    const data = fs.readFileSync('./schema.graphql', 'utf8');
    const schema_definition = fs.readFileSync('./schema.graphql', 'utf8');
    return `you are a backend engineer with expertise in graphgl, help me write a graphql request of
    ###
    how many moments do andrés iniesta have
    ###
    based on the graphql schema below. Please don't include fragement in the returning response:
    ${schema_definition}
    {}
`;
  } catch (err) {
    console.error(err);
  }

}
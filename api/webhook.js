const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const params = (req.body && req.body.queryResult && req.body.queryResult.parameters) || {};
  const height = Number(params.height);
  const weight = Number(params.weight);

  if (!height || !weight) {
    return res.json({ fulfillmentText: 'Please tell me your height in cm and weight in kg.' });
  }

  const hM = height / 100;
  const bmi = weight / (hM * hM);
  const bmiRounded = Math.round(bmi * 100) / 100;

  let category = '';
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal weight';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';

  const message = `Your BMI is ${bmiRounded} (${category}).`;
  res.json({ fulfillmentText: message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
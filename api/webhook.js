// api/webhook.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    let body = req.body;

    // If body is a raw string, parse it
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Invalid JSON:", e);
        return res.status(400).json({ fulfillmentText: "Invalid request format." });
      }
    }

    const params = body?.queryResult?.parameters || {};

    // Parse safely
    let weight = parseFloat(params.weight_value);
    let height = parseFloat(params.height_value);
    let weight_unit = (params.weight_unit || "").toLowerCase();
    let height_unit = (params.height_unit || "").toLowerCase();

    if (!weight || !height || isNaN(weight) || isNaN(height)) {
      return res.json({
        fulfillmentText: "I need both your height and weight to calculate BMI."
      });
    }

    // Convert weight to kg
    if (weight_unit.includes("lb") || weight_unit.includes("pound")) {
      weight *= 0.45359237;
    }

    // Convert height to meters
    if (height_unit.startsWith("cm")) height /= 100;
    else if (height_unit.startsWith("in")) height *= 0.0254;
    else if (height_unit.startsWith("ft")) height *= 0.3048;
    else if (height > 3) height /= 100; // assume cm if >3

    // Avoid division by zero
    if (height <= 0) {
      return res.json({
        fulfillmentText: "Height must be greater than zero."
      });
    }

    // Calculate BMI
    const bmi = weight / (height * height);
    const bmiRounded = Math.round(bmi * 10) / 10;

    // Determine category
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";

    return res.json({
      fulfillmentText: `Your BMI is ${bmiRounded} (${category}).`
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({
      fulfillmentText: "Sorry, there was an error calculating your BMI."
    });
  }
}

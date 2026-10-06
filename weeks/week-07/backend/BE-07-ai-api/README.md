# AI Quiz API

BE-07 adds one small AI workflow to an Express API: `POST /quiz` asks Gemini for a multiple-choice quiz and only returns it after checking the response against an application schema.

## Setup

~~~bash
copy .env.example .env
npm install
npm start
~~~

Create a Gemini API key in Google AI Studio and put it in `.env`. Never commit `.env`. Set `AI_ENABLED=false` to turn the feature off without removing the route.

## Endpoint

`POST /quiz` accepts `easy`, `medium`, or `hard` and between 1 and 10 questions. Every returned question has text, four distinct options, an answer index from 0 to 3, and an explanation.

~~~json
{
  "topic": "HTTP status codes",
  "difficulty": "easy",
  "questionCount": 3
}
~~~

## Reliability choices

- Gemini structured-output mode receives the same JSON schema used by the application.
- The provider uses a 12-second timeout and retries only transient 429/5xx responses.
- JSON parsing and schema validation still happen locally; model output is never trusted just because the provider was asked for JSON.
- One repair request is attempted when the first response is malformed or fails validation.
- Invalid repaired output returns `502` instead of being passed to a caller.
- Request validation returns `400`, and the kill switch returns `503`.
- Gemini usage metadata is logged without logging prompts, API keys, or generated content.

## Check

~~~bash
npm test
~~~

The eight tests cover health, input validation, the kill switch, a valid response, one repair attempt, and fail-closed behavior. They use a provider double, so they do not require a paid or personal API key. A live smoke test needs the learner's own Gemini key in `.env`.

## Mistakes I checked before writing it

- Treating model JSON as trustworthy: output is parsed and checked twice.
- Retrying every error: only rate-limit and server errors are retried.
- Retrying forever: the provider has two retries and the service has one repair call.
- Letting a huge prompt or request run unchecked: body size, topic length, count, and timeout are bounded.
- Leaking secrets or user content into logs: only usage counts and error labels are logged.
- Forgetting an emergency stop: `AI_ENABLED=false` returns 503 before any model call.

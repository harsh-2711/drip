# API key setup

you can find a LiteLLM API key on https:/ rabbithole.cred.club that allows you to access the
LLM endpoint.

## Configuring Tools with LiteLLM

### Command Line Interface Setup
```
bash
# Set your API key as an environment variable
export LITELLM_API_KEY="your-api-key-here"
# Set the API base URL
export OPENAI_API_BASE="https://api.rabbithole.cred.club/v1"
##Using with cURL
bash
curl -X POST
"https://api.rabbithole.cred.club/v1/chat/completions" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer your-api-key-here" \
-d '{
"model": "model-name-here",
"messages": [{"role": "user", "content": "Hello world!"}]
}'
```

## Available endpoints
Authorize
model management

GET
/models
Model List

GET
/v1/models
Model List

POST
/model/new
Add New Model

POST
/model/update
Update Model

GET
/v1/model/info
Model Info V1

GET
/model/info
Model Info V1

GET
/model_group/info
Model Group Info

POST
/model/delete
Delete Model

PATCH
/model/{model_id}/update
Patch Model

chat/completions

POST
/openai/deployments/{model}/chat/completions
Chat Completion

POST
/engines/{model}/chat/completions
Chat Completion

POST
/chat/completions
Chat Completion

POST
/v1/chat/completions
Chat Completion

completions

POST
/openai/deployments/{model}/completions
Completion

POST
/engines/{model}/completions
Completion

POST
/completions
Completion

POST
/v1/completions
Completion

embeddings

POST
/openai/deployments/{model}/embeddings
Embeddings

POST
/engines/{model}/embeddings
Embeddings

POST
/embeddings
Embeddings

POST
/v1/embeddings
Embeddings

images

POST
/images/generations
Image Generation

POST
/v1/images/generations
Image Generation

audio

POST
/audio/speech
Audio Speech

POST
/v1/audio/speech
Audio Speech

POST
/audio/transcriptions
Audio Transcriptions

POST
/v1/audio/transcriptions
Audio Transcriptions

assistants

GET
/assistants
Get Assistants

POST
/assistants
Create Assistant

GET
/v1/assistants
Get Assistants

POST
/v1/assistants
Create Assistant

DELETE
/assistants/{assistant_id}
Delete Assistant

DELETE
/v1/assistants/{assistant_id}
Delete Assistant

POST
/threads
Create Threads

POST
/v1/threads
Create Threads

GET
/threads/{thread_id}
Get Thread

GET
/v1/threads/{thread_id}
Get Thread

POST
/threads/{thread_id}/messages
Add Messages

GET
/threads/{thread_id}/messages
Get Messages

POST
/v1/threads/{thread_id}/messages
Add Messages

GET
/v1/threads/{thread_id}/messages
Get Messages

POST
/threads/{thread_id}/runs
Run Thread

POST
/v1/threads/{thread_id}/runs
Run Thread

moderations

POST
/moderations
Moderations

POST
/v1/moderations
Moderations

llm utils

POST
/utils/token_counter
Token Counter

GET
/utils/supported_openai_params
Supported Openai Params

POST
/utils/transform_request
Transform Request

default

GET
/
Home

GET
/routes
Get Routes

GET
/config/pass_through_endpoint
Get Pass Through Endpoints

POST
/config/pass_through_endpoint
Create Pass Through Endpoints

DELETE
/config/pass_through_endpoint
Delete Pass Through Endpoints

POST
/config/pass_through_endpoint/{endpoint_id}
Update Pass Through Endpoints

GET
/team/available
List Available Teams

GET
/provider/budgets
Provider Budgets
batch

POST
/batches
Create Batch

GET
/batches
List Batches

POST
/v1/batches
Create Batch

GET
/v1/batches
List Batches

POST
/{provider}/v1/batches
Create Batch

GET
/{provider}/v1/batches
List Batches

GET
/batches/{batch_id}
Retrieve Batch

GET
/v1/batches/{batch_id}
Retrieve Batch

GET
/{provider}/v1/batches/{batch_id}
Retrieve Batch

POST
/batches/{batch_id}/cancel
Cancel Batch

POST
/v1/batches/{batch_id}/cancel
Cancel Batch

POST
/{provider}/v1/batches/{batch_id}/cancel
Cancel Batch

rerank

POST
/rerank
Rerank

POST
/v1/rerank
Rerank

POST
/v2/rerank
Rerank

fine-tuning

POST
/fine_tuning/jobs
✨ (Enterprise) Create Fine-Tuning Job

GET
/fine_tuning/jobs
✨ (Enterprise) List Fine-Tuning Jobs

POST
/v1/fine_tuning/jobs
✨ (Enterprise) Create Fine-Tuning Job

GET
/v1/fine_tuning/jobs
✨ (Enterprise) List Fine-Tuning Jobs

GET
/fine_tuning/jobs/{fine_tuning_job_id}
✨ (Enterprise) Retrieve Fine-Tuning Job

GET
/v1/fine_tuning/jobs/{fine_tuning_job_id}
✨ (Enterprise) Retrieve Fine-Tuning Job

POST
/fine_tuning/jobs/{fine_tuning_job_id}/cancel
✨ (Enterprise) Cancel Fine-Tuning Jobs

POST
/v1/fine_tuning/jobs/{fine_tuning_job_id}/cancel
✨ (Enterprise) Cancel Fine-Tuning Jobs

Vertex AI Pass-through

GET
/vertex_ai/{endpoint}
Vertex Proxy Route

POST
/vertex_ai/{endpoint}
Vertex Proxy Route

PUT
/vertex_ai/{endpoint}
Vertex Proxy Route

PATCH
/vertex_ai/{endpoint}
Vertex Proxy Route

DELETE
/vertex_ai/{endpoint}
Vertex Proxy Route
pass-through

GET
/vertex_ai/{endpoint}
Vertex Proxy Route

POST
/vertex_ai/{endpoint}
Vertex Proxy Route

PUT
/vertex_ai/{endpoint}
Vertex Proxy Route

PATCH
/vertex_ai/{endpoint}
Vertex Proxy Route

DELETE
/vertex_ai/{endpoint}
Vertex Proxy Route

GET
/gemini/{endpoint}
Gemini Proxy Route

POST
/gemini/{endpoint}
Gemini Proxy Route

PUT
/gemini/{endpoint}
Gemini Proxy Route

PATCH
/gemini/{endpoint}
Gemini Proxy Route

DELETE
/gemini/{endpoint}
Gemini Proxy Route

GET
/cohere/{endpoint}
Cohere Proxy Route

POST
/cohere/{endpoint}
Cohere Proxy Route

PUT
/cohere/{endpoint}
Cohere Proxy Route

PATCH
/cohere/{endpoint}
Cohere Proxy Route

DELETE
/cohere/{endpoint}
Cohere Proxy Route

GET
/anthropic/{endpoint}
Anthropic Proxy Route

POST
/anthropic/{endpoint}
Anthropic Proxy Route

PUT
/anthropic/{endpoint}
Anthropic Proxy Route

PATCH
/anthropic/{endpoint}
Anthropic Proxy Route

DELETE
/anthropic/{endpoint}
Anthropic Proxy Route

GET
/bedrock/{endpoint}
Bedrock Proxy Route

POST
/bedrock/{endpoint}
Bedrock Proxy Route

PUT
/bedrock/{endpoint}
Bedrock Proxy Route

PATCH
/bedrock/{endpoint}
Bedrock Proxy Route

DELETE
/bedrock/{endpoint}
Bedrock Proxy Route

GET
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

POST
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

PUT
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

PATCH
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

DELETE
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

GET
/assemblyai/{endpoint}
Assemblyai Proxy Route

POST
/assemblyai/{endpoint}
Assemblyai Proxy Route

PUT
/assemblyai/{endpoint}
Assemblyai Proxy Route

PATCH
/assemblyai/{endpoint}
Assemblyai Proxy Route

DELETE
/assemblyai/{endpoint}
Assemblyai Proxy Route

GET
/azure/{endpoint}
Azure Proxy Route

POST
/azure/{endpoint}
Azure Proxy Route

PUT
/azure/{endpoint}
Azure Proxy Route

PATCH
/azure/{endpoint}
Azure Proxy Route

DELETE
/azure/{endpoint}
Azure Proxy Route

GET
/openai/{endpoint}
Openai Proxy Route

POST
/openai/{endpoint}
Openai Proxy Route

PUT
/openai/{endpoint}
Openai Proxy Route

PATCH
/openai/{endpoint}
Openai Proxy Route

DELETE
/openai/{endpoint}
Openai Proxy Route

GET
/langfuse/{endpoint}
Langfuse Proxy Route

POST
/langfuse/{endpoint}
Langfuse Proxy Route

PUT
/langfuse/{endpoint}
Langfuse Proxy Route

PATCH
/langfuse/{endpoint}
Langfuse Proxy Route

DELETE
/langfuse/{endpoint}
Langfuse Proxy Route
Google AI Studio Pass-through

GET
/gemini/{endpoint}
Gemini Proxy Route

POST
/gemini/{endpoint}
Gemini Proxy Route

PUT
/gemini/{endpoint}
Gemini Proxy Route

PATCH
/gemini/{endpoint}
Gemini Proxy Route

DELETE
/gemini/{endpoint}
Gemini Proxy Route
Cohere Pass-through

GET
/cohere/{endpoint}
Cohere Proxy Route

POST
/cohere/{endpoint}
Cohere Proxy Route

PUT
/cohere/{endpoint}
Cohere Proxy Route

PATCH
/cohere/{endpoint}
Cohere Proxy Route

DELETE
/cohere/{endpoint}
Cohere Proxy Route

Anthropic Pass-through

GET
/anthropic/{endpoint}
Anthropic Proxy Route

POST
/anthropic/{endpoint}
Anthropic Proxy Route

PUT
/anthropic/{endpoint}
Anthropic Proxy Route

PATCH
/anthropic/{endpoint}
Anthropic Proxy Route

DELETE
/anthropic/{endpoint}
Anthropic Proxy Route

Bedrock Pass-through

GET
/bedrock/{endpoint}
Bedrock Proxy Route

POST
/bedrock/{endpoint}
Bedrock Proxy Route

PUT
/bedrock/{endpoint}
Bedrock Proxy Route

PATCH
/bedrock/{endpoint}
Bedrock Proxy Route

DELETE
/bedrock/{endpoint}
Bedrock Proxy Route

AssemblyAI EU Pass-through

GET
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

POST
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

PUT
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

PATCH
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

DELETE
/eu.assemblyai/{endpoint}
Assemblyai Proxy Route

AssemblyAI Pass-through

GET
/assemblyai/{endpoint}
Assemblyai Proxy Route

POST
/assemblyai/{endpoint}
Assemblyai Proxy Route

PUT
/assemblyai/{endpoint}
Assemblyai Proxy Route

PATCH
/assemblyai/{endpoint}
Assemblyai Proxy Route

DELETE
/assemblyai/{endpoint}
Assemblyai Proxy Route

Azure Pass-through

GET
/azure/{endpoint}
Azure Proxy Route

POST
/azure/{endpoint}
Azure Proxy Route

PUT
/azure/{endpoint}
Azure Proxy Route

PATCH
/azure/{endpoint}
Azure Proxy Route

DELETE
/azure/{endpoint}
Azure Proxy Route

OpenAI Pass-through

GET
/openai/{endpoint}
Openai Proxy Route

POST
/openai/{endpoint}
Openai Proxy Route

PUT
/openai/{endpoint}
Openai Proxy Route

PATCH
/openai/{endpoint}
Openai Proxy Route

DELETE
/openai/{endpoint}
Openai Proxy Route

Langfuse Pass-through

GET
/langfuse/{endpoint}
Langfuse Proxy Route

POST
/langfuse/{endpoint}
Langfuse Proxy Route

PUT
/langfuse/{endpoint}
Langfuse Proxy Route

PATCH
/langfuse/{endpoint}
Langfuse Proxy Route

DELETE
/langfuse/{endpoint}
Langfuse Proxy Route
health

GET
/test
Test Endpoint

GET
/health/services
Health Services Endpoint

GET
/health
Health Endpoint

GET
/active/callbacks
Active Callbacks

GET
/settings
Active Callbacks

GET
/health/readiness
Health Readiness

OPTIONS
/health/readiness
Health Readiness Options

GET
/health/liveness
Health Liveliness

OPTIONS
/health/liveness
Health Liveliness Options

GET
/health/liveliness
Health Liveliness

OPTIONS
/health/liveliness
Health Liveliness Options

key management

POST
/key/generate
Generate Key Fn

POST
/key/update
Update Key Fn

POST
/key/delete
Delete Key Fn

GET
/key/info
Info Key Fn

POST
/key/regenerate
Regenerate Key Fn

POST
/key/{key}/regenerate
Regenerate Key Fn

GET
/key/list
List Keys

POST
/key/block
Block Key

POST
/key/unblock
Unblock Key

POST
/key/health
Key Health

Internal User management

POST
/user/new
New User

GET
/user/info
User Info

POST
/user/update
User Update

GET
/user/list
Get Users

GET
/user/get_users
Get Users

POST
/user/delete
Delete User

team management

POST
/team/new
New Team

POST
/team/update
Update Team

POST
/team/member_add
Team Member Add

POST
/team/member_delete
Team Member Delete

POST
/team/member_update
Team Member Update

POST
/team/delete
Delete Team

GET
/team/info
Team Info

POST
/team/block
Block Team

POST
/team/unblock
Unblock Team

GET
/team/list
List Team

POST
/team/model/add
Team Model Add

POST
/team/model/delete
Team Model Delete

POST
/team/{team_id}/callback
Add Team Callbacks

GET
/team/{team_id}/callback
Get Team Callbacks

POST
/team/{team_id}/disable_logging
Disable Team Logging

organization management

POST
/organization/new
New Organization

PATCH
/organization/update
Update Organization

DELETE
/organization/delete
Delete Organization

GET
/organization/list
List Organization

GET
/organization/info
Info Organization

POST
/organization/info
Deprecated Info Organization

POST
/organization/member_add
Organization Member Add

PATCH
/organization/member_update
Organization Member Update

DELETE
/organization/member_delete
Organization Member Delete

Customer Management

POST
/customer/block
Block User

POST
/customer/unblock
Unblock User

POST
/customer/new
New End User

GET
/customer/info
End User Info

POST
/customer/update
Update End User

POST
/customer/delete
Delete End User

GET
/customer/list
List End User

Budget & Spend Tracking

GET
/spend/tags
View Spend Tags

GET
/global/spend/report
Get Global Spend Report

GET
/global/spend/tags
Global View Spend Tags

POST
/spend/calculate
Calculate Spend

GET
/spend/logs
View Spend Logs

POST
/global/spend/reset
Global Spend Reset

POST
/add/allowed_ip
Add Allowed Ip

POST
/delete/allowed_ip
Delete Allowed Ip

caching

GET
/cache/ping
Cache Ping

POST
/cache/delete
Cache Delete

GET
/cache/redis/info
Cache Redis Info

POST
/cache/flushall
Cache Flushall

Guardrails

GET
/guardrails/list
List Guardrails

files

POST
/files
Create File

GET
/files
List Files

POST
/v1/files
Create File

GET
/v1/files
List Files

POST
/{provider}/v1/files
Create File

GET
/{provider}/v1/files
List Files

GET
/files/{file_id}/content
Get File Content

GET
/v1/files/{file_id}/content
Get File Content

GET
/{provider}/v1/files/{file_id}/content
Get File Content

GET
/files/{file_id}
Get File

DELETE
/files/{file_id}
Delete File

GET
/v1/files/{file_id}
Get File

DELETE
/v1/files/{file_id}
Delete File

GET
/{provider}/v1/files/{file_id}
Get File

DELETE
/{provider}/v1/files/{file_id}
Delete File

budget management

POST
/budget/new
New Budget

POST
/budget/update
Update Budget

POST
/budget/info
Info Budget

GET
/budget/settings
Budget Settings

GET
/budget/list
List Budget

POST
/budget/delete
Delete Budget

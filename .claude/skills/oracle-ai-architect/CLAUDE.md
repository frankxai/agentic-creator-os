# Oracle AI Architect

Comprehensive AI architecture expertise for Oracle Cloud Infrastructure - from Generative AI to Autonomous Database 26ai, NVIDIA NIM integration, and enterprise-grade agent development.

## When to Use This Skill

- Designing AI solutions on OCI
- Architecting multi-cloud AI with Oracle components
- Evaluating Oracle AI vs other cloud providers
- Building production AI agents on Oracle infrastructure

## Oracle AI Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  AI Agents │ RAG Apps │ Chatbots │ Document Processing          │
├─────────────────────────────────────────────────────────────────┤
│                    DEVELOPMENT LAYER                             │
│  Oracle ADK │ Agent Hub │ AI Data Platform Workbench            │
├─────────────────────────────────────────────────────────────────┤
│                    MODEL LAYER                                   │
│  OCI Generative AI      │  NVIDIA NIM    │  Private AI Containers│
│  - Cohere Command A     │  - 100+ models │  - ONNX models        │
│  - Llama 4 Maverick     │  - Embeddings  │  - Custom fine-tuned  │
│  - Embed 4              │  - RAG         │                       │
├─────────────────────────────────────────────────────────────────┤
│                    AI SERVICES LAYER                             │
│  Vision │ Language │ Speech │ Document Understanding │ Anomaly  │
├─────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                    │
│  Autonomous AI Database 26ai                                     │
│  - AI Vector Search     │  Select AI Agents  │  JSON Duality     │
│  - NVIDIA NIM integration│  MCP Server support│  Graph analytics  │
├─────────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                          │
│  NVIDIA GPUs (H100/GB200) │ Zettascale Cluster │ FastConnect     │
└─────────────────────────────────────────────────────────────────┘
```

## OCI Generative AI Service

### Available Models (2026)

| Model | Parameters | Context | Best For |
|-------|-----------|---------|----------|
| **Cohere Command A** | Latest | 256K tokens | Tool use, agents, RAG, multilingual |
| **Llama 4 Maverick** | 17B active/400B total | Large | Complex reasoning (MoE) |
| **Llama 4 Scout** | 17B active/109B total | Efficient | Cost-optimized inference |
| **Llama 3.3** | 70B | Fine-tunable | Custom use cases |
| **Cohere Embed 4** | - | - | Vector embeddings |

### Fine-Tuning Options

| Model | Method | Use Case |
|-------|--------|----------|
| Cohere Command | T-Few / Vanilla | Task-specific adaptation |
| Llama 3 | LoRA | Efficient large model tuning |

### Production Features
- Content moderation controls
- Endpoint model swap (zero downtime)
- Endpoint deactivation/activation
- Agent Hub for agent management
- Sovereign/classified cloud deployment

## Oracle Database 26ai AI Features

### AI Vector Search
```sql
-- Create vector column
CREATE TABLE documents (
    id NUMBER,
    content CLOB,
    embedding VECTOR(1536, FLOAT32)
);

-- Similarity search
SELECT id, content
FROM documents
ORDER BY VECTOR_DISTANCE(embedding, :query_vector, COSINE)
FETCH FIRST 10 ROWS ONLY;
```

### Select AI (Natural Language to SQL)
```sql
-- Enable Select AI
SELECT AI "Show me last quarter's top 10 customers by revenue";

-- Returns actual SQL result, not just the query
```

### Select AI Agents (NEW in 26ai)
```sql
-- Define agent with tools
DBMS_CLOUD_AI.CREATE_AGENT(
    agent_name => 'sales_assistant',
    tools => JSON('[
        {"type": "database", "tables": ["customers", "orders"]},
        {"type": "rest", "endpoint": "https://api.crm.com/lookup"}
    ]'),
    mcp_servers => JSON('["postgres-mcp", "salesforce-mcp"]')
);

-- Run agent
SELECT AI AGENT 'sales_assistant' 'Analyze Q4 performance and create summary';
```

### NVIDIA Integration
- NeMo Retriever API support
- NIM container integration for embeddings
- cuVS for GPU-accelerated vector operations

## NVIDIA NIM on OCI

### Deployment Options

1. **OCI Console Native** (New 2026)
   - 160+ AI tools available
   - 100+ NIM microservices
   - One-click deployment

2. **Bare Metal / VM**
   - Full control
   - Strong isolation
   - Custom configurations

3. **AI Blueprints** (No-code)
   - Pre-configured recipes
   - Hardware recommendations
   - Built-in observability

### Available NIM Microservices
- LLM inference
- Embedding generation
- RAG pipelines
- Vision models
- Speech recognition

## AI Data Platform (AIDP)

### Medallion Architecture
```
┌─────────────────────────────────────────────────────────┐
│ BRONZE (Raw)        │ SILVER (Cleaned)   │ GOLD (Curated) │
│ Object Storage      │ Data Engineering   │ Autonomous DB  │
│ - Raw data landing  │ - ETL/Spark        │ - Query-ready  │
│ - Any format        │ - Quality checks   │ - AI-optimized │
└─────────────────────────────────────────────────────────┘
```

### AIDP Workbench
- Unified notebook environment
- Spark-based data processing
- ML model training
- Governed data catalogs
- Collaborative workflows

## OCI AI Services (Pre-trained)

| Service | Capability | Use Case |
|---------|-----------|----------|
| **Vision** | Image/object detection | Manufacturing QA, asset tagging |
| **Language** | NLP (sentiment, NER, translation) | Customer feedback analysis |
| **Speech** | ASR + TTS (Whisper support) | Voice interfaces, transcription |
| **Document Understanding** | OCR, table extraction | Invoice processing, contracts |
| **Anomaly Detection** | Outlier identification | Fraud, predictive maintenance |

## Oracle Agent Development

### Oracle ADK
```python
from oci_adk import Agent, FunctionTool

@FunctionTool(name="query_sales")
def query_sales(region: str, quarter: str):
    return adb.execute(f"SELECT * FROM sales WHERE region='{region}'")

agent = Agent(
    name="sales_analyst",
    model="cohere.command-a",
    tools=[query_sales]
)
```

### Agent Hub (OCI Generative AI)
- Centralized agent management
- Built-in governance
- Deployment orchestration
- Monitoring and logging

### Oracle Agent Spec (Framework-agnostic)
```yaml
version: "1.0"
agent:
  name: EnterpriseBot
  components:
    classifier:
      type: LLMNode
      model: cohere.command-a
    executor:
      type: AgentNode
      tools: [database_tool, api_tool]
```

## Multi-Cloud Strategy

### Oracle's Unique Position

| Capability | Oracle Advantage |
|-----------|------------------|
| **Database** | 26ai is only DB with native AI Vector Search + Select AI Agents |
| **Licensing** | Bring Oracle licenses to any cloud (BYOL) |
| **Sovereign AI** | Classified cloud deployment (US Gov) |
| **Cost** | 20-40% cheaper than AWS/Azure |
| **NVIDIA** | Deep NIM integration, Zettascale cluster |

### Multi-Cloud Deployment
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   AWS        │    │   Azure      │    │   OCI        │
│   (Apps)     │    │   (M365)     │    │   (Data+AI)  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       └───────────────────┴────────────────────┘
                          │
                ┌─────────▼─────────┐
                │  Oracle Database  │
                │  (Any Cloud)      │
                │  - ADB Dedicated  │
                │  - Exadata C@C    │
                │  - DB@Azure/AWS   │
                └───────────────────┘
```

## Architecture Decision Framework

### When to Use Oracle AI

**Best Fit:**
- Existing Oracle Database investment
- Need Select AI / AI Vector Search in database
- Want integrated agent development with ADK
- Sovereign/classified workloads
- Cost-sensitive with predictable usage

**Consider Alternatives:**
- Need OpenAI GPT-4o specifically → Azure OpenAI
- Deep AWS ecosystem already → Bedrock
- Google-native org → Vertex AI

### Recommended Stack for Enterprise AI

```
┌─────────────────────────────────────────────────┐
│              RECOMMENDED ORACLE AI STACK         │
├─────────────────────────────────────────────────┤
│ Agents:     Oracle ADK + Agent Hub               │
│ Models:     Cohere Command A / Llama 4           │
│ Database:   Autonomous AI Database 26ai          │
│ Vectors:    AI Vector Search (native)            │
│ NL-to-SQL:  Select AI Agents                     │
│ Inference:  NVIDIA NIM on OCI                    │
│ Processing: AI Data Platform Workbench           │
│ Governance: OCI IAM + Data Safe                  │
└─────────────────────────────────────────────────┘
```

---

## 💰 OCI AI VERIFIED PRICING (January 2026)

> **IMPORTANT**: Pricing verified against official Oracle sources. Always confirm at [oracle.com/cloud/price-list](https://www.oracle.com/cloud/price-list/).

### Always Free AI Resources

| Resource | Free Allocation | Notes |
|----------|-----------------|-------|
| **Autonomous Database** | 2 instances (20GB each) | Includes AI Vector Search |
| **Ampere A1 Compute** | 3,000 OCPU-hrs/mo | For NIM or custom inference |
| **Network Load Balancer** | 1 NLB | FREE, no data charges |
| **Data Egress** | 10 TB/month | Per region |

### OCI Generative AI Pricing

| Model | Input Tokens | Output Tokens | Best For |
|-------|--------------|---------------|----------|
| **Cohere Command A** | ~$0.0015/1K | ~$0.002/1K | Agents, RAG, tools |
| **Cohere Command Light** | ~$0.0003/1K | ~$0.0006/1K | Simple tasks |
| **Llama 4 Maverick** | ~$0.001/1K | ~$0.002/1K | Complex reasoning |
| **Llama 4 Scout** | ~$0.0005/1K | ~$0.001/1K | Cost-optimized |
| **Cohere Embed 4** | ~$0.0001/1K | N/A | Embeddings |

**Monthly Estimate (moderate usage ~1M tokens)**: ~$2-5/mo

### Autonomous Database 26ai Pricing

| Configuration | Price | Notes |
|---------------|-------|-------|
| **Always Free** | **$0** | 2 instances, 20GB, AI Vector Search included |
| **Paid (ECPU)** | $0.336/ECPU-hr | License included |
| **Paid (BYOL)** | $0.0807/ECPU-hr | 76% savings |
| **Minimum Paid** | ~$238/mo | 2 ECPU continuous |
| **Elastic Pools** | Up to 87% compute savings | Multi-DB consolidation |

**AI Vector Search**: Included FREE in all Autonomous Database tiers

### NVIDIA NIM on OCI Pricing

| Deployment | Cost | Notes |
|------------|------|-------|
| **AI Blueprints (Console)** | Compute only | No NIM license fee |
| **VM.GPU.A10.1** | ~$2.50/hr | Single A10 GPU |
| **VM.GPU.A10.2** | ~$5.00/hr | 2x A10 GPUs |
| **BM.GPU.H100.8** | ~$30/hr | 8x H100 GPUs |
| **Reserved H100 (1yr)** | ~$18/hr | 40% savings |

**Container Instance with GPU**: Same compute pricing, uses free tier pool for CPU

### Compute for AI Workloads

| Shape | Price | Use Case |
|-------|-------|----------|
| **VM.Standard.A1.Flex** | **$0.0165/OCPU-hr** | Agents, API servers |
| **Container Instance** | **$0.0165/OCPU-hr** | Serverless inference |
| **BM.GPU.H100.8** | ~$30/hr | Large model training |
| **BM.GPU4.8 (A100)** | ~$15/hr | Inference, fine-tuning |

**First 3,000 OCPU-hours FREE** (Ampere A1)

### Storage for AI

| Service | Price/GB/Month | Use Case |
|---------|----------------|----------|
| **Object Storage** | **$0.0255** | Model weights, datasets |
| **Archive** | **$0.0026** | Training data retention |
| **Block Volume** | $0.0255 | High-IOPS model storage |

### AI Architecture Cost Examples

**RAG Chatbot (Small)**:
| Component | Monthly Cost |
|-----------|-------------|
| Autonomous DB (Vector Search) | $0 (Always Free) |
| Container Instance (API) | $0-18 |
| Cohere Command A (~500K tokens) | ~$1-2 |
| Object Storage (10GB docs) | $0.26 |
| **TOTAL** | **$0-20/mo** |

**Production AI Agent System**:
| Component | Monthly Cost |
|-----------|-------------|
| Autonomous DB 26ai (4 ECPU) | ~$500 |
| OKE (3 nodes, A1) | ~$100 |
| GenAI API (5M tokens) | ~$10-15 |
| Object Storage (100GB) | ~$2.55 |
| Load Balancer | ~$20 |
| **TOTAL** | **~$630/mo** |

**Enterprise NVIDIA NIM Deployment**:
| Component | Monthly Cost |
|-----------|-------------|
| BM.GPU.H100.8 (reserved) | ~$13,000 |
| Autonomous DB (production) | ~$1,500 |
| Object Storage (1TB) | ~$26 |
| FastConnect (10 Gbps) | ~$2,200 |
| **TOTAL** | **~$16,700/mo** |

### Cost Comparison: OCI vs AWS Bedrock

| Scenario | OCI | AWS | Savings |
|----------|-----|-----|---------|
| **1M tokens (Cohere/Claude)** | ~$2 | ~$8-15 | **75-85%** |
| **Vector DB (500K vectors)** | $0 (ADB Free) | $70+ (Pinecone) | **100%** |
| **50TB Egress** | ~$340 | ~$4,500 | **92%** |
| **GPU Instance (H100/mo)** | ~$13,000 | ~$25,000 | **48%** |

### OCI AI Accelerator Packs (NEW)

Pre-configured AI solution bundles for quick deployment:
- **RAG Pack**: GenAI + Vector Search + Object Storage
- **Agent Pack**: ADK + Agent Hub + ADB
- **Vision Pack**: AI Vision + Object Storage + Functions

> Pricing varies by pack - check OCI Console for current bundles

### Pricing Verification Resources

- **OCI Price List**: https://www.oracle.com/cloud/price-list/
- **Cost Estimator**: https://www.oracle.com/cloud/costestimator.html
- **Always Free**: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- **GenAI Pricing**: https://www.oracle.com/artificial-intelligence/generative-ai/pricing/

> **Last Verified**: January 2026
> **Source**: Oracle official documentation and price lists

---

## Related Skills

- `oci-services-expert` - General OCI architecture (includes full pricing reference)
- `oracle-adk` - Agent development details
- `oracle-agent-spec` - Framework-agnostic agents
- `oracle-database-expert` - Database optimization

## Resources

- [OCI Generative AI](https://www.oracle.com/artificial-intelligence/generative-ai/generative-ai-service/)
- [Oracle Database 26ai](https://www.oracle.com/database/26ai/)
- [AI Data Platform](https://www.oracle.com/ai-data-platform/)
- [NVIDIA on OCI](https://www.oracle.com/cloud/nvidia/)
- [Oracle ADK Docs](https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/adk/)

---

*Architect enterprise AI solutions leveraging Oracle's unique database-centric approach and multi-cloud flexibility.*

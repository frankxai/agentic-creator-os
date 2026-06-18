export class TierRouter {
  /**
   * Decides which model tier (1, 2, or 3) to route a task to based on keywords and metadata.
   * Tier 1: Cheap / Local (Flash, Llama-3-8B)
   * Tier 2: Smart / Vision (Sonnet 3.5, GPT-4o)
   * Tier 3: Reasoning (o1, o3-mini, DeepSeek-R1)
   */
  static routeTask(taskDescription, taskType) {
    const desc = (taskDescription || '').toLowerCase();
    const type = (taskType || '').toLowerCase();

    // 1. Explicit overrides for reasoning tier
    if (desc.includes('/cso') || desc.includes('architect') || desc.includes('security-audit') || desc.includes('cryptography')) {
      return 3;
    }

    // 2. Map task type to tier
    switch (type) {
      case 'refactor':
      case 'security-audit':
      case 'complex-debugging':
      case 'architecture':
        return 3; // Reasoning
        
      case 'coding':
      case 'design-audit':
      case 'social-generation':
      case 'content-writing':
        return 2; // Smart / Vision
        
      case 'linting':
      case 'summarize':
      case 'file-lookup':
      case 'format':
        return 1; // Cheap / Local
        
      default:
        // 3. Fallback check on keywords
        if (desc.match(/(fix|refactor|optimize|optimize-performance)/)) {
          return 2;
        }
        return 1;
    }
  }
}

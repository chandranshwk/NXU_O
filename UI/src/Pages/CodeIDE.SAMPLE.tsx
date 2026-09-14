/**
 * @interface SampleProblemData
 * @description Formal core structural contract definition for application problem data parameters.
 * Accommodates empty workspace initializations and non-niche practice targets via an optional codeTemplates matrix layer.
 */
export interface SampleProblemData {
  id: number;
  title: string;
  titleSlug: string;
  category: string;
  description: {
    markdown: string;
    html: string;
  };
  constraints: string[];
  examples: Array<{
    id: number;
    input: string;
    output: string;
    explanation?: string;
  }>;
  tags: string[];
  codeTemplates?: Array<{
    language: string;
    slug: string;
    starterCode: string;
  }>;
}

export const DATAIDE = {
  id: 1,
  title: "Two Sum",
  titleSlug: "two-sum",
  difficulty: "Easy",
  category: "Algorithms",
  likes: 54320,
  dislikes: 1800,
  description: {
    markdown:
      "Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.\n\nYou may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.",
    html: "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>\n<p>You may assume that each input would have <em><strong>exactly</strong> one solution</em>, and you may not use the <em>same</em> element twice.</p>\n<p>You can return the answer in any order.</p>",
  },
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  examples: [
    {
      id: 1,
      input: "nums =, target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      id: 2,
      input: "nums =, target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  tags: ["Array", "Hash Table"],
  codeTemplates: [
    {
      language: "Javascript",
      slug: "javascript",
      starterCode:
        "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
    },
    {
      language: "Python",
      slug: "python",
      starterCode:
        "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
    },
    {
      language: "Java",
      slug: "java",
      starterCode:
        "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    },
  ],
  testCases: [
    {
      input: "[2,7,11,15]\n9",
      expectedOutput: "[0,1]",
    },
    {
      input: "[3,2,4]\n6",
      expectedOutput: "[1,2]",
    },
  ],
  sampleSolution: {
    javascript:
      "var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};",
  },
} as const;

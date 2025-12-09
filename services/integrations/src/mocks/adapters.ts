import { faker } from "@faker-js/faker";

// GitHub API Mock
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  default_branch: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  state: "open" | "closed" | "merged";
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubWebhookEvent {
  action: string;
  repository: GitHubRepo;
  sender: {
    login: string;
  };
}

export class MockGitHubAdapter {
  private repos: GitHubRepo[] = [];
  private prs: Map<string, GitHubPullRequest[]> = new Map();
  private commits: Map<string, GitHubCommit[]> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // Generate mock repositories
    for (let i = 0; i < 20; i++) {
      const repoName = faker.lorem.slug();
      const repo: GitHubRepo = {
        id: i + 1,
        name: repoName,
        full_name: `acme-corp/${repoName}`,
        private: faker.datatype.boolean(),
        html_url: `https://github.com/acme-corp/${repoName}`,
        description: faker.company.catchPhrase(),
        fork: false,
        created_at: faker.date.past({ years: 2 }).toISOString(),
        updated_at: faker.date.recent({ days: 30 }).toISOString(),
        pushed_at: faker.date.recent({ days: 7 }).toISOString(),
        stargazers_count: faker.number.int({ min: 0, max: 500 }),
        watchers_count: faker.number.int({ min: 0, max: 200 }),
        language: faker.helpers.arrayElement([
          "TypeScript",
          "JavaScript",
          "Python",
          "Go",
        ]),
        default_branch: "main",
      };

      this.repos.push(repo);

      // Generate PRs for each repo
      const prs: GitHubPullRequest[] = [];
      for (let j = 0; j < faker.number.int({ min: 5, max: 20 }); j++) {
        prs.push({
          id: j + 1,
          number: j + 1,
          state: faker.helpers.arrayElement(["open", "closed", "merged"]),
          title: faker.lorem.sentence(),
          body: faker.lorem.paragraphs(2),
          created_at: faker.date.recent({ days: 30 }).toISOString(),
          updated_at: faker.date.recent({ days: 15 }).toISOString(),
          merged_at:
            Math.random() > 0.5
              ? faker.date.recent({ days: 10 }).toISOString()
              : undefined,
          user: {
            login: faker.internet.userName(),
            avatar_url: faker.image.avatar(),
          },
          head: {
            ref: `feature/${faker.lorem.slug()}`,
            sha: faker.git.commitSha(),
          },
          base: {
            ref: "main",
            sha: faker.git.commitSha(),
          },
        });
      }
      this.prs.set(repo.full_name, prs);

      // Generate commits
      const commits: GitHubCommit[] = [];
      for (let k = 0; k < faker.number.int({ min: 20, max: 100 }); k++) {
        commits.push({
          sha: faker.git.commitSha(),
          commit: {
            message: faker.git.commitMessage(),
            author: {
              name: faker.person.fullName(),
              email: faker.internet.email(),
              date: faker.date.recent({ days: 30 }).toISOString(),
            },
          },
          author: {
            login: faker.internet.userName(),
            avatar_url: faker.image.avatar(),
          },
        });
      }
      this.commits.set(repo.full_name, commits);
    }
  }

  public getRepos(): GitHubRepo[] {
    return this.repos;
  }

  public getRepo(owner: string, repo: string): GitHubRepo | undefined {
    return this.repos.find((r) => r.full_name === `${owner}/${repo}`);
  }

  public getPullRequests(owner: string, repo: string): GitHubPullRequest[] {
    return this.prs.get(`${owner}/${repo}`) || [];
  }

  public getCommits(owner: string, repo: string): GitHubCommit[] {
    return this.commits.get(`${owner}/${repo}`) || [];
  }

  public async simulateWebhook(
    event: string,
    payload: Partial<GitHubWebhookEvent>
  ): Promise<void> {
    // Simulate webhook processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`[MockGitHub] Webhook received: ${event}`, payload);
  }
}

// Slack API Mock
export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  is_archived: boolean;
  num_members: number;
  topic: {
    value: string;
  };
  purpose: {
    value: string;
  };
}

export interface SlackMessage {
  ts: string;
  user: string;
  text: string;
  channel: string;
  thread_ts?: string;
}

export class MockSlackAdapter {
  private channels: SlackChannel[] = [];
  private messages: Map<string, SlackMessage[]> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const channelNames = [
      "general",
      "qa-team",
      "engineering",
      "test-results",
      "deployments",
      "alerts",
    ];

    channelNames.forEach((name, i) => {
      const channelId = `C${faker.string.alphanumeric(10).toUpperCase()}`;
      this.channels.push({
        id: channelId,
        name,
        is_channel: true,
        is_private: false,
        is_archived: false,
        num_members: faker.number.int({ min: 5, max: 50 }),
        topic: {
          value: faker.company.catchPhrase(),
        },
        purpose: {
          value: faker.lorem.sentence(),
        },
      });

      // Generate messages for each channel
      const messages: SlackMessage[] = [];
      for (let j = 0; j < faker.number.int({ min: 10, max: 50 }); j++) {
        messages.push({
          ts: Date.now().toString(),
          user: `U${faker.string.alphanumeric(10).toUpperCase()}`,
          text: faker.lorem.sentence(),
          channel: channelId,
        });
      }
      this.messages.set(channelId, messages);
    });
  }

  public getChannels(): SlackChannel[] {
    return this.channels;
  }

  public getMessages(channelId: string): SlackMessage[] {
    return this.messages.get(channelId) || [];
  }

  public async postMessage(
    channel: string,
    text: string
  ): Promise<SlackMessage> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const message: SlackMessage = {
      ts: Date.now().toString(),
      user: "UBOT",
      text,
      channel,
    };
    const channelMessages = this.messages.get(channel) || [];
    channelMessages.push(message);
    this.messages.set(channel, channelMessages);
    return message;
  }
}

// Jira API Mock
export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
    };
    priority: {
      name: string;
    };
    assignee: {
      displayName: string;
      emailAddress: string;
    } | null;
    created: string;
    updated: string;
  };
}

export class MockJiraAdapter {
  private issues: JiraIssue[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const statuses = ["To Do", "In Progress", "In Review", "Done"];
    const priorities = ["Highest", "High", "Medium", "Low", "Lowest"];

    for (let i = 0; i < 50; i++) {
      this.issues.push({
        id: `${10000 + i}`,
        key: `ACME-${i + 1}`,
        fields: {
          summary: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          status: {
            name: faker.helpers.arrayElement(statuses),
          },
          priority: {
            name: faker.helpers.arrayElement(priorities),
          },
          assignee:
            Math.random() > 0.3
              ? {
                  displayName: faker.person.fullName(),
                  emailAddress: faker.internet.email(),
                }
              : null,
          created: faker.date.past({ years: 1 }).toISOString(),
          updated: faker.date.recent({ days: 30 }).toISOString(),
        },
      });
    }
  }

  public getIssues(): JiraIssue[] {
    return this.issues;
  }

  public getIssue(key: string): JiraIssue | undefined {
    return this.issues.find((i) => i.key === key);
  }
}

// Sentry API Mock
export interface SentryError {
  id: string;
  title: string;
  culprit: string;
  level: "error" | "warning" | "info" | "fatal";
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  status: "unresolved" | "resolved" | "ignored";
}

export class MockSentryAdapter {
  private errors: SentryError[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const levels: SentryError["level"][] = [
      "error",
      "warning",
      "info",
      "fatal",
    ];
    const statuses: SentryError["status"][] = [
      "unresolved",
      "resolved",
      "ignored",
    ];

    for (let i = 0; i < 100; i++) {
      this.errors.push({
        id: faker.string.uuid(),
        title: faker.lorem.sentence(),
        culprit: `app/${faker.lorem.slug()}.ts`,
        level: faker.helpers.arrayElement(levels),
        count: faker.number.int({ min: 1, max: 1000 }),
        userCount: faker.number.int({ min: 1, max: 500 }),
        firstSeen: faker.date.past({ years: 1 }).toISOString(),
        lastSeen: faker.date.recent({ days: 7 }).toISOString(),
        status: faker.helpers.arrayElement(statuses),
      });
    }
  }

  public getErrors(): SentryError[] {
    return this.errors;
  }
}

// Datadog API Mock
export interface DatadogMetric {
  metric: string;
  points: Array<[number, number]>;
  type: "gauge" | "rate" | "count";
  tags: string[];
}

export class MockDatadogAdapter {
  public async getMetrics(query: string): Promise<DatadogMetric[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate sample metrics
    const metrics: DatadogMetric[] = [];
    const metricNames = [
      "cpu.usage",
      "memory.usage",
      "requests.count",
      "errors.count",
      "response.time",
    ];

    metricNames.forEach((name) => {
      const points: Array<[number, number]> = [];
      const now = Date.now();
      for (let i = 0; i < 24; i++) {
        points.push([
          now - (24 - i) * 3600000,
          faker.number.float({ min: 0, max: 100 }),
        ]);
      }

      metrics.push({
        metric: name,
        points,
        type: name.includes("count") ? "count" : "gauge",
        tags: ["env:production", "service:api"],
      });
    });

    return metrics;
  }
}

// Jenkins/CI Mock
export interface JenkinsBuild {
  number: number;
  result: "SUCCESS" | "FAILURE" | "UNSTABLE" | "ABORTED" | null;
  building: boolean;
  duration: number;
  timestamp: number;
  url: string;
}

export class MockJenkinsAdapter {
  private builds: JenkinsBuild[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const results: Array<JenkinsBuild["result"]> = [
      "SUCCESS",
      "FAILURE",
      "UNSTABLE",
      null,
    ];

    for (let i = 0; i < 100; i++) {
      this.builds.push({
        number: i + 1,
        result: faker.helpers.arrayElement(results),
        building: i === 99 && Math.random() > 0.7,
        duration: faker.number.int({ min: 60000, max: 1800000 }),
        timestamp: faker.date.recent({ days: 30 }).getTime(),
        url: `https://jenkins.acme.com/job/main/${i + 1}/`,
      });
    }
  }

  public getBuilds(): JenkinsBuild[] {
    return this.builds;
  }

  public getBuild(buildNumber: number): JenkinsBuild | undefined {
    return this.builds.find((b) => b.number === buildNumber);
  }
}

// Ollama Mock
export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class MockOllamaAdapter {
  public async generate(prompt: string): Promise<OllamaResponse> {
    // Simulate LLM processing time
    await new Promise((resolve) =>
      setTimeout(resolve, faker.number.int({ min: 500, max: 2000 }))
    );

    // Generate realistic-looking AI response
    const responses = [
      "Based on the test failure patterns, I recommend updating the selector to use data-testid attributes for better stability.",
      "The flaky test appears to be caused by timing issues. Consider adding explicit waits before the assertion.",
      "This selector can be improved by using a more specific CSS selector that targets the unique attributes of the element.",
      "The test is failing due to DOM changes. I suggest using a combination of role and text-based selectors for better resilience.",
    ];

    return {
      model: "llama3.1:8b",
      created_at: new Date().toISOString(),
      response: faker.helpers.arrayElement(responses),
      done: true,
    };
  }
}

export function createMockAdapters() {
  return {
    github: new MockGitHubAdapter(),
    slack: new MockSlackAdapter(),
    jira: new MockJiraAdapter(),
    sentry: new MockSentryAdapter(),
    datadog: new MockDatadogAdapter(),
    jenkins: new MockJenkinsAdapter(),
    ollama: new MockOllamaAdapter(),
  };
}

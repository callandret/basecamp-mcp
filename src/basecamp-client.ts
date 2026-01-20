export class BasecampClient {
  private accessToken: string;
  private accountId: string;
  private userAgent: string;

  constructor(accessToken: string, accountId: string, appName: string, contactEmail: string) {
    this.accessToken = accessToken;
    this.accountId = accountId;
    this.userAgent = `${appName} (${contactEmail})`;
  }

  private get baseUrl() {
    return `https://3.basecampapi.com/${this.accountId}`;
  }

  private async request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': this.userAgent,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Basecamp API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Projects
  async listProjects() {
    return this.request('/projects.json');
  }

  async getProject(projectId: string) {
    return this.request(`/projects/${projectId}.json`);
  }

  async createProject(name: string, description?: string) {
    return this.request('/projects.json', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  }

  // To-do Sets
  async getTodoset(projectId: string, todosetId: string) {
    return this.request(`/buckets/${projectId}/todosets/${todosetId}.json`);
  }

  // To-do Lists
  async getTodoLists(projectId: string, todosetId: string, status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/buckets/${projectId}/todosets/${todosetId}/todolists.json${query}`);
  }

  async getTodoList(projectId: string, todolistId: string) {
    return this.request(`/buckets/${projectId}/todolists/${todolistId}.json`);
  }

  async createTodoList(projectId: string, todosetId: string, name: string, description?: string) {
    return this.request(`/buckets/${projectId}/todosets/${todosetId}/todolists.json`, {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  }

  async updateTodoList(projectId: string, todolistId: string, name?: string, description?: string) {
    return this.request(`/buckets/${projectId}/todolists/${todolistId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ name, description })
    });
  }

  // To-dos
  async getTodos(projectId: string, todolistId: string, status?: string, completed?: boolean) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (completed !== undefined) params.append('completed', completed.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/buckets/${projectId}/todolists/${todolistId}/todos.json${query}`);
  }

  async getTodo(projectId: string, todoId: string) {
    return this.request(`/buckets/${projectId}/todos/${todoId}.json`);
  }

  async createTodo(projectId: string, todolistId: string, content: string, options?: {
    description?: string;
    assignee_ids?: number[];
    completion_subscriber_ids?: number[];
    due_on?: string;
    starts_on?: string;
    notify?: boolean;
  }) {
    return this.request(`/buckets/${projectId}/todolists/${todolistId}/todos.json`, {
      method: 'POST',
      body: JSON.stringify({ content, ...options })
    });
  }

  async updateTodo(projectId: string, todoId: string, options?: {
    content?: string;
    description?: string;
    assignee_ids?: number[];
    completion_subscriber_ids?: number[];
    due_on?: string;
    starts_on?: string;
    notify?: boolean;
  }) {
    return this.request(`/buckets/${projectId}/todos/${todoId}.json`, {
      method: 'PUT',
      body: JSON.stringify(options)
    });
  }

  async completeTodo(projectId: string, todoId: string) {
    return this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
      method: 'POST'
    });
  }

  async uncompleteTodo(projectId: string, todoId: string) {
    return this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
      method: 'DELETE'
    });
  }

  async repositionTodo(projectId: string, todoId: string, position: number) {
    return this.request(`/buckets/${projectId}/todos/${todoId}/reposition.json`, {
      method: 'POST',
      body: JSON.stringify({ position })
    });
  }

  // Messages
  async getMessages(projectId: string, messageboardId: string) {
    return this.request(`/buckets/${projectId}/message_boards/${messageboardId}/messages.json`);
  }

  async getMessage(projectId: string, messageId: string) {
    return this.request(`/buckets/${projectId}/messages/${messageId}.json`);
  }

  async createMessage(projectId: string, messageboardId: string, subject: string, content: string, options?: {
    category_id?: number;
    status?: string;
  }) {
    return this.request(`/buckets/${projectId}/message_boards/${messageboardId}/messages.json`, {
      method: 'POST',
      body: JSON.stringify({ subject, content, ...options })
    });
  }

  async updateMessage(projectId: string, messageId: string, subject?: string, content?: string, category_id?: number) {
    return this.request(`/buckets/${projectId}/messages/${messageId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ subject, content, category_id })
    });
  }

  async pinMessage(projectId: string, messageId: string) {
    return this.request(`/buckets/${projectId}/messages/${messageId}/pin.json`, {
      method: 'POST'
    });
  }

  // People
  async listPeople() {
    return this.request('/people.json');
  }

  async getMe() {
    return this.request('/my/profile.json');
  }

  // Comments
  async getComments(projectId: string, recordingId: string) {
    return this.request(`/buckets/${projectId}/recordings/${recordingId}/comments.json`);
  }

  async getComment(projectId: string, commentId: string) {
    return this.request(`/buckets/${projectId}/comments/${commentId}.json`);
  }

  async createComment(projectId: string, recordingId: string, content: string) {
    return this.request(`/buckets/${projectId}/recordings/${recordingId}/comments.json`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  async updateComment(projectId: string, commentId: string, content: string) {
    return this.request(`/buckets/${projectId}/comments/${commentId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  }

  // Recordings (trash, archive, unarchive)
  async getRecordings(type: string, options?: {
    bucket?: string;
    status?: string;
    sort?: string;
    direction?: string;
  }) {
    const params = new URLSearchParams({ type });
    if (options?.bucket) params.append('bucket', options.bucket);
    if (options?.status) params.append('status', options.status);
    if (options?.sort) params.append('sort', options.sort);
    if (options?.direction) params.append('direction', options.direction);
    return this.request(`/projects/recordings.json?${params.toString()}`);
  }

  async trashRecording(projectId: string, recordingId: string) {
    return this.request(`/buckets/${projectId}/recordings/${recordingId}/status/trashed.json`, {
      method: 'PUT'
    });
  }

  async archiveRecording(projectId: string, recordingId: string) {
    return this.request(`/buckets/${projectId}/recordings/${recordingId}/status/archived.json`, {
      method: 'PUT'
    });
  }

  async unarchiveRecording(projectId: string, recordingId: string) {
    return this.request(`/buckets/${projectId}/recordings/${recordingId}/status/active.json`, {
      method: 'PUT'
    });
  }

  // Schedule
  async getSchedule(projectId: string, scheduleId: string) {
    return this.request(`/buckets/${projectId}/schedules/${scheduleId}.json`);
  }

  async updateSchedule(projectId: string, scheduleId: string, includeDueAssignments: boolean) {
    return this.request(`/buckets/${projectId}/schedules/${scheduleId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ include_due_assignments: includeDueAssignments })
    });
  }

  async getScheduleEntries(projectId: string, scheduleId: string) {
    return this.request(`/buckets/${projectId}/schedules/${scheduleId}/entries.json`);
  }

  async getScheduleEntry(projectId: string, entryId: string) {
    return this.request(`/buckets/${projectId}/schedule_entries/${entryId}.json`);
  }

  async createScheduleEntry(projectId: string, scheduleId: string, summary: string, options: {
    starts_at: string;
    ends_at: string;
    description?: string;
    participant_ids?: number[];
    all_day?: boolean;
    notify?: boolean;
  }) {
    return this.request(`/buckets/${projectId}/schedules/${scheduleId}/entries.json`, {
      method: 'POST',
      body: JSON.stringify({ summary, ...options })
    });
  }

  async updateScheduleEntry(projectId: string, entryId: string, options?: {
    summary?: string;
    starts_at?: string;
    ends_at?: string;
    description?: string;
    participant_ids?: number[];
    all_day?: boolean;
    notify?: boolean;
  }) {
    return this.request(`/buckets/${projectId}/schedule_entries/${entryId}.json`, {
      method: 'PUT',
      body: JSON.stringify(options)
    });
  }

  // Card Tables
  async getCardTable(projectId: string, cardTableId: string) {
    return this.request(`/buckets/${projectId}/card_tables/${cardTableId}.json`);
  }

  // Card Table Cards
  async getCards(projectId: string, columnId: string) {
    return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/cards.json`);
  }

  async getCard(projectId: string, cardId: string) {
    return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}.json`);
  }

  async createCard(projectId: string, columnId: string, title: string, options?: {
    content?: string;
    due_on?: string;
    assignee_ids?: number[];
    notify?: boolean;
  }) {
    return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/cards.json`, {
      method: 'POST',
      body: JSON.stringify({ title, ...options })
    });
  }

  async updateCard(projectId: string, cardId: string, options?: {
    title?: string;
    content?: string;
    due_on?: string;
    assignee_ids?: number[];
  }) {
    return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}.json`, {
      method: 'PUT',
      body: JSON.stringify(options)
    });
  }

  // Card Table Columns
  async getColumn(projectId: string, columnId: string) {
    return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}.json`);
  }

  async createColumn(projectId: string, cardTableId: string, title: string, description?: string) {
    return this.request(`/buckets/${projectId}/card_tables/${cardTableId}/columns.json`, {
      method: 'POST',
      body: JSON.stringify({ title, description })
    });
  }

  async updateColumn(projectId: string, columnId: string, title?: string, description?: string) {
    return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ title, description })
    });
  }

  async moveColumn(projectId: string, cardTableId: string, sourceId: string, targetId: string, position?: string) {
    return this.request(`/buckets/${projectId}/card_tables/${cardTableId}/moves.json`, {
      method: 'POST',
      body: JSON.stringify({ source_id: sourceId, target_id: targetId, position })
    });
  }

  async changeColumnColor(projectId: string, columnId: string, color: string) {
    return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}/color.json`, {
      method: 'PUT',
      body: JSON.stringify({ color })
    });
  }

  async subscribeToColumn(projectId: string, columnId: string) {
    return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/subscription.json`, {
      method: 'POST'
    });
  }

  async unsubscribeFromColumn(projectId: string, columnId: string) {
    return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/subscription.json`, {
      method: 'DELETE'
    });
  }

  async enableOnHold(projectId: string, columnId: string) {
    return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}/on_hold.json`, {
      method: 'POST'
    });
  }

  async disableOnHold(projectId: string, columnId: string) {
    return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}/on_hold.json`, {
      method: 'DELETE'
    });
  }

  // Card Table Steps
  async createStep(projectId: string, cardId: string, title: string, options?: {
    due_on?: string;
    assignee_ids?: number[];
  }) {
    return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}/steps.json`, {
      method: 'POST',
      body: JSON.stringify({ title, ...options })
    });
  }

  async updateStep(projectId: string, stepId: string, options?: {
    title?: string;
    due_on?: string;
    assignee_ids?: number[];
  }) {
    return this.request(`/buckets/${projectId}/card_tables/steps/${stepId}.json`, {
      method: 'PUT',
      body: JSON.stringify(options)
    });
  }

  async completeStep(projectId: string, stepId: string, completed: boolean) {
    return this.request(`/buckets/${projectId}/card_tables/steps/${stepId}/completions.json`, {
      method: 'PUT',
      body: JSON.stringify({ on: completed ? 'on' : 'off' })
    });
  }

  async repositionStep(projectId: string, cardId: string, sourceId: string, position: number) {
    return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}/positions.json`, {
      method: 'POST',
      body: JSON.stringify({ source_id: sourceId, position })
    });
  }

  // Campfires (Chat)
  async getAllCampfires() {
    return this.request('/chats.json');
  }

  async getCampfire(projectId: string, chatId: string) {
    return this.request(`/buckets/${projectId}/chats/${chatId}.json`);
  }

  async getCampfireLines(projectId: string, chatId: string) {
    return this.request(`/buckets/${projectId}/chats/${chatId}/lines.json`);
  }

  async getCampfireLine(projectId: string, chatId: string, lineId: string) {
    return this.request(`/buckets/${projectId}/chats/${chatId}/lines/${lineId}.json`);
  }

  async createCampfireLine(projectId: string, chatId: string, content: string) {
    return this.request(`/buckets/${projectId}/chats/${chatId}/lines.json`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  async deleteCampfireLine(projectId: string, chatId: string, lineId: string) {
    return this.request(`/buckets/${projectId}/chats/${chatId}/lines/${lineId}.json`, {
      method: 'DELETE'
    });
  }

  // Questionnaires
  async getQuestionnaire(projectId: string, questionnaireId: string) {
    return this.request(`/buckets/${projectId}/questionnaires/${questionnaireId}.json`);
  }

  // Questions
  async getQuestions(projectId: string, questionnaireId: string) {
    return this.request(`/buckets/${projectId}/questionnaires/${questionnaireId}/questions.json`);
  }

  async getQuestion(projectId: string, questionId: string) {
    return this.request(`/buckets/${projectId}/questions/${questionId}.json`);
  }

  // Question Answers
  async getQuestionAnswers(projectId: string, questionId: string) {
    return this.request(`/buckets/${projectId}/questions/${questionId}/answers.json`);
  }

  async getQuestionAnswer(projectId: string, answerId: string) {
    return this.request(`/buckets/${projectId}/question_answers/${answerId}.json`);
  }

  // Attachments
  async createAttachment(file: BodyInit, filename: string, contentType: string, contentLength: number) {
    const response = await fetch(`https://3.basecampapi.com/${this.accountId}/attachments.json?name=${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': this.userAgent,
        'Content-Type': contentType,
        'Content-Length': contentLength.toString()
      },
      body: file
    });

    if (!response.ok) {
      throw new Error(`Basecamp API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Documents
  async getDocuments(projectId: string, vaultId: string) {
    return this.request(`/buckets/${projectId}/vaults/${vaultId}/documents.json`);
  }

  async getDocument(projectId: string, documentId: string) {
    return this.request(`/buckets/${projectId}/documents/${documentId}.json`);
  }

  async createDocument(projectId: string, vaultId: string, title: string, content: string, status?: string) {
    return this.request(`/buckets/${projectId}/vaults/${vaultId}/documents.json`, {
      method: 'POST',
      body: JSON.stringify({ title, content, status })
    });
  }

  async updateDocument(projectId: string, documentId: string, title?: string, content?: string) {
    return this.request(`/buckets/${projectId}/documents/${documentId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ title, content })
    });
  }

  // Uploads/Files
  async getUploads(projectId: string, vaultId: string) {
    return this.request(`/buckets/${projectId}/vaults/${vaultId}/uploads.json`);
  }

  async getUpload(projectId: string, uploadId: string) {
    return this.request(`/buckets/${projectId}/uploads/${uploadId}.json`);
  }

  async createUpload(projectId: string, vaultId: string, attachableSgid: string, options?: {
    description?: string;
    base_name?: string;
  }) {
    return this.request(`/buckets/${projectId}/vaults/${vaultId}/uploads.json`, {
      method: 'POST',
      body: JSON.stringify({ attachable_sgid: attachableSgid, ...options })
    });
  }

  async updateUpload(projectId: string, uploadId: string, options?: {
    description?: string;
    base_name?: string;
  }) {
    return this.request(`/buckets/${projectId}/uploads/${uploadId}.json`, {
      method: 'PUT',
      body: JSON.stringify(options)
    });
  }

  // Message Boards
  async getMessageBoard(projectId: string, messageBoardId: string) {
    return this.request(`/buckets/${projectId}/message_boards/${messageBoardId}.json`);
  }

  // Vaults (Folders in Docs & Files)
  async getVaults(projectId: string, vaultId: string) {
    return this.request(`/buckets/${projectId}/vaults/${vaultId}/vaults.json`);
  }

  async getVault(projectId: string, vaultId: string) {
    return this.request(`/buckets/${projectId}/vaults/${vaultId}.json`);
  }

  async createVault(projectId: string, parentVaultId: string, title: string) {
    return this.request(`/buckets/${projectId}/vaults/${parentVaultId}/vaults.json`, {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async updateVault(projectId: string, vaultId: string, title: string) {
    return this.request(`/buckets/${projectId}/vaults/${vaultId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ title })
    });
  }

  // Project Templates
  async getTemplates(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/templates.json${query}`);
  }

  async getTemplate(templateId: string) {
    return this.request(`/templates/${templateId}.json`);
  }

  async createTemplate(name: string, description?: string) {
    return this.request('/templates.json', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  }

  async updateTemplate(templateId: string, name?: string, description?: string) {
    return this.request(`/templates/${templateId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ name, description })
    });
  }

  async deleteTemplate(templateId: string) {
    return this.request(`/templates/${templateId}.json`, {
      method: 'DELETE'
    });
  }

  async createProjectFromTemplate(templateId: string, name: string, description?: string) {
    return this.request(`/templates/${templateId}/project_constructions.json`, {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  }

  async getProjectConstruction(templateId: string, constructionId: string) {
    return this.request(`/templates/${templateId}/project_constructions/${constructionId}.json`);
  }

  // Search
  async getSearchMetadata() {
    return this.request('/searches/metadata.json');
  }

  async search(query: string, options?: {
    type?: string;
    bucket_id?: string;
    creator_id?: string;
    file_type?: string;
    exclude_chat?: boolean;
    page?: number;
    per_page?: number;
  }) {
    const params = new URLSearchParams({ q: query });
    if (options?.type) params.append('type', options.type);
    if (options?.bucket_id) params.append('bucket_id', options.bucket_id);
    if (options?.creator_id) params.append('creator_id', options.creator_id);
    if (options?.file_type) params.append('file_type', options.file_type);
    if (options?.exclude_chat) params.append('exclude_chat', '1');
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    return this.request(`/search.json?${params.toString()}`);
  }
}
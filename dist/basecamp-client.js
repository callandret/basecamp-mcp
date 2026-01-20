export class BasecampClient {
    accessToken;
    accountId;
    userAgent;
    constructor(accessToken, accountId, appName, contactEmail) {
        this.accessToken = accessToken;
        this.accountId = accountId;
        this.userAgent = `${appName} (${contactEmail})`;
    }
    get baseUrl() {
        return `https://3.basecampapi.com/${this.accountId}`;
    }
    async request(path, options = {}) {
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
    async getProject(projectId) {
        return this.request(`/projects/${projectId}.json`);
    }
    async createProject(name, description) {
        return this.request('/projects.json', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
    }
    // To-do Sets
    async getTodoset(projectId, todosetId) {
        return this.request(`/buckets/${projectId}/todosets/${todosetId}.json`);
    }
    // To-do Lists
    async getTodoLists(projectId, todosetId, status) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/buckets/${projectId}/todosets/${todosetId}/todolists.json${query}`);
    }
    async getTodoList(projectId, todolistId) {
        return this.request(`/buckets/${projectId}/todolists/${todolistId}.json`);
    }
    async createTodoList(projectId, todosetId, name, description) {
        return this.request(`/buckets/${projectId}/todosets/${todosetId}/todolists.json`, {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
    }
    async updateTodoList(projectId, todolistId, name, description) {
        return this.request(`/buckets/${projectId}/todolists/${todolistId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ name, description })
        });
    }
    // To-dos
    async getTodos(projectId, todolistId, status, completed) {
        const params = new URLSearchParams();
        if (status)
            params.append('status', status);
        if (completed !== undefined)
            params.append('completed', completed.toString());
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/buckets/${projectId}/todolists/${todolistId}/todos.json${query}`);
    }
    async getTodo(projectId, todoId) {
        return this.request(`/buckets/${projectId}/todos/${todoId}.json`);
    }
    async createTodo(projectId, todolistId, content, options) {
        return this.request(`/buckets/${projectId}/todolists/${todolistId}/todos.json`, {
            method: 'POST',
            body: JSON.stringify({ content, ...options })
        });
    }
    async updateTodo(projectId, todoId, options) {
        return this.request(`/buckets/${projectId}/todos/${todoId}.json`, {
            method: 'PUT',
            body: JSON.stringify(options)
        });
    }
    async completeTodo(projectId, todoId) {
        return this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
            method: 'POST'
        });
    }
    async uncompleteTodo(projectId, todoId) {
        return this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
            method: 'DELETE'
        });
    }
    async repositionTodo(projectId, todoId, position) {
        return this.request(`/buckets/${projectId}/todos/${todoId}/reposition.json`, {
            method: 'POST',
            body: JSON.stringify({ position })
        });
    }
    // Messages
    async getMessages(projectId, messageboardId) {
        return this.request(`/buckets/${projectId}/message_boards/${messageboardId}/messages.json`);
    }
    async getMessage(projectId, messageId) {
        return this.request(`/buckets/${projectId}/messages/${messageId}.json`);
    }
    async createMessage(projectId, messageboardId, subject, content, options) {
        return this.request(`/buckets/${projectId}/message_boards/${messageboardId}/messages.json`, {
            method: 'POST',
            body: JSON.stringify({ subject, content, ...options })
        });
    }
    async updateMessage(projectId, messageId, subject, content, category_id) {
        return this.request(`/buckets/${projectId}/messages/${messageId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ subject, content, category_id })
        });
    }
    async pinMessage(projectId, messageId) {
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
    async getComments(projectId, recordingId) {
        return this.request(`/buckets/${projectId}/recordings/${recordingId}/comments.json`);
    }
    async getComment(projectId, commentId) {
        return this.request(`/buckets/${projectId}/comments/${commentId}.json`);
    }
    async createComment(projectId, recordingId, content) {
        return this.request(`/buckets/${projectId}/recordings/${recordingId}/comments.json`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }
    async updateComment(projectId, commentId, content) {
        return this.request(`/buckets/${projectId}/comments/${commentId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    }
    // Recordings (trash, archive, unarchive)
    async getRecordings(type, options) {
        const params = new URLSearchParams({ type });
        if (options?.bucket)
            params.append('bucket', options.bucket);
        if (options?.status)
            params.append('status', options.status);
        if (options?.sort)
            params.append('sort', options.sort);
        if (options?.direction)
            params.append('direction', options.direction);
        return this.request(`/projects/recordings.json?${params.toString()}`);
    }
    async trashRecording(projectId, recordingId) {
        return this.request(`/buckets/${projectId}/recordings/${recordingId}/status/trashed.json`, {
            method: 'PUT'
        });
    }
    async archiveRecording(projectId, recordingId) {
        return this.request(`/buckets/${projectId}/recordings/${recordingId}/status/archived.json`, {
            method: 'PUT'
        });
    }
    async unarchiveRecording(projectId, recordingId) {
        return this.request(`/buckets/${projectId}/recordings/${recordingId}/status/active.json`, {
            method: 'PUT'
        });
    }
    // Schedule
    async getSchedule(projectId, scheduleId) {
        return this.request(`/buckets/${projectId}/schedules/${scheduleId}.json`);
    }
    async updateSchedule(projectId, scheduleId, includeDueAssignments) {
        return this.request(`/buckets/${projectId}/schedules/${scheduleId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ include_due_assignments: includeDueAssignments })
        });
    }
    async getScheduleEntries(projectId, scheduleId) {
        return this.request(`/buckets/${projectId}/schedules/${scheduleId}/entries.json`);
    }
    async getScheduleEntry(projectId, entryId) {
        return this.request(`/buckets/${projectId}/schedule_entries/${entryId}.json`);
    }
    async createScheduleEntry(projectId, scheduleId, summary, options) {
        return this.request(`/buckets/${projectId}/schedules/${scheduleId}/entries.json`, {
            method: 'POST',
            body: JSON.stringify({ summary, ...options })
        });
    }
    async updateScheduleEntry(projectId, entryId, options) {
        return this.request(`/buckets/${projectId}/schedule_entries/${entryId}.json`, {
            method: 'PUT',
            body: JSON.stringify(options)
        });
    }
    // Card Tables
    async getCardTable(projectId, cardTableId) {
        return this.request(`/buckets/${projectId}/card_tables/${cardTableId}.json`);
    }
    // Card Table Cards
    async getCards(projectId, columnId) {
        return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/cards.json`);
    }
    async getCard(projectId, cardId) {
        return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}.json`);
    }
    async createCard(projectId, columnId, title, options) {
        return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/cards.json`, {
            method: 'POST',
            body: JSON.stringify({ title, ...options })
        });
    }
    async updateCard(projectId, cardId, options) {
        return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}.json`, {
            method: 'PUT',
            body: JSON.stringify(options)
        });
    }
    // Card Table Columns
    async getColumn(projectId, columnId) {
        return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}.json`);
    }
    async createColumn(projectId, cardTableId, title, description) {
        return this.request(`/buckets/${projectId}/card_tables/${cardTableId}/columns.json`, {
            method: 'POST',
            body: JSON.stringify({ title, description })
        });
    }
    async updateColumn(projectId, columnId, title, description) {
        return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ title, description })
        });
    }
    async moveColumn(projectId, cardTableId, sourceId, targetId, position) {
        return this.request(`/buckets/${projectId}/card_tables/${cardTableId}/moves.json`, {
            method: 'POST',
            body: JSON.stringify({ source_id: sourceId, target_id: targetId, position })
        });
    }
    async changeColumnColor(projectId, columnId, color) {
        return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}/color.json`, {
            method: 'PUT',
            body: JSON.stringify({ color })
        });
    }
    async subscribeToColumn(projectId, columnId) {
        return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/subscription.json`, {
            method: 'POST'
        });
    }
    async unsubscribeFromColumn(projectId, columnId) {
        return this.request(`/buckets/${projectId}/card_tables/lists/${columnId}/subscription.json`, {
            method: 'DELETE'
        });
    }
    async enableOnHold(projectId, columnId) {
        return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}/on_hold.json`, {
            method: 'POST'
        });
    }
    async disableOnHold(projectId, columnId) {
        return this.request(`/buckets/${projectId}/card_tables/columns/${columnId}/on_hold.json`, {
            method: 'DELETE'
        });
    }
    // Card Table Steps
    async createStep(projectId, cardId, title, options) {
        return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}/steps.json`, {
            method: 'POST',
            body: JSON.stringify({ title, ...options })
        });
    }
    async updateStep(projectId, stepId, options) {
        return this.request(`/buckets/${projectId}/card_tables/steps/${stepId}.json`, {
            method: 'PUT',
            body: JSON.stringify(options)
        });
    }
    async completeStep(projectId, stepId, completed) {
        return this.request(`/buckets/${projectId}/card_tables/steps/${stepId}/completions.json`, {
            method: 'PUT',
            body: JSON.stringify({ on: completed ? 'on' : 'off' })
        });
    }
    async repositionStep(projectId, cardId, sourceId, position) {
        return this.request(`/buckets/${projectId}/card_tables/cards/${cardId}/positions.json`, {
            method: 'POST',
            body: JSON.stringify({ source_id: sourceId, position })
        });
    }
    // Campfires (Chat)
    async getAllCampfires() {
        return this.request('/chats.json');
    }
    async getCampfire(projectId, chatId) {
        return this.request(`/buckets/${projectId}/chats/${chatId}.json`);
    }
    async getCampfireLines(projectId, chatId) {
        return this.request(`/buckets/${projectId}/chats/${chatId}/lines.json`);
    }
    async getCampfireLine(projectId, chatId, lineId) {
        return this.request(`/buckets/${projectId}/chats/${chatId}/lines/${lineId}.json`);
    }
    async createCampfireLine(projectId, chatId, content) {
        return this.request(`/buckets/${projectId}/chats/${chatId}/lines.json`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }
    async deleteCampfireLine(projectId, chatId, lineId) {
        return this.request(`/buckets/${projectId}/chats/${chatId}/lines/${lineId}.json`, {
            method: 'DELETE'
        });
    }
    // Questionnaires
    async getQuestionnaire(projectId, questionnaireId) {
        return this.request(`/buckets/${projectId}/questionnaires/${questionnaireId}.json`);
    }
    // Questions
    async getQuestions(projectId, questionnaireId) {
        return this.request(`/buckets/${projectId}/questionnaires/${questionnaireId}/questions.json`);
    }
    async getQuestion(projectId, questionId) {
        return this.request(`/buckets/${projectId}/questions/${questionId}.json`);
    }
    // Question Answers
    async getQuestionAnswers(projectId, questionId) {
        return this.request(`/buckets/${projectId}/questions/${questionId}/answers.json`);
    }
    async getQuestionAnswer(projectId, answerId) {
        return this.request(`/buckets/${projectId}/question_answers/${answerId}.json`);
    }
    // Attachments
    async createAttachment(file, filename, contentType, contentLength) {
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
    async getDocuments(projectId, vaultId) {
        return this.request(`/buckets/${projectId}/vaults/${vaultId}/documents.json`);
    }
    async getDocument(projectId, documentId) {
        return this.request(`/buckets/${projectId}/documents/${documentId}.json`);
    }
    async createDocument(projectId, vaultId, title, content, status) {
        return this.request(`/buckets/${projectId}/vaults/${vaultId}/documents.json`, {
            method: 'POST',
            body: JSON.stringify({ title, content, status })
        });
    }
    async updateDocument(projectId, documentId, title, content) {
        return this.request(`/buckets/${projectId}/documents/${documentId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ title, content })
        });
    }
    // Uploads/Files
    async getUploads(projectId, vaultId) {
        return this.request(`/buckets/${projectId}/vaults/${vaultId}/uploads.json`);
    }
    async getUpload(projectId, uploadId) {
        return this.request(`/buckets/${projectId}/uploads/${uploadId}.json`);
    }
    async createUpload(projectId, vaultId, attachableSgid, options) {
        return this.request(`/buckets/${projectId}/vaults/${vaultId}/uploads.json`, {
            method: 'POST',
            body: JSON.stringify({ attachable_sgid: attachableSgid, ...options })
        });
    }
    async updateUpload(projectId, uploadId, options) {
        return this.request(`/buckets/${projectId}/uploads/${uploadId}.json`, {
            method: 'PUT',
            body: JSON.stringify(options)
        });
    }
    // Message Boards
    async getMessageBoard(projectId, messageBoardId) {
        return this.request(`/buckets/${projectId}/message_boards/${messageBoardId}.json`);
    }
    // Vaults (Folders in Docs & Files)
    async getVaults(projectId, vaultId) {
        return this.request(`/buckets/${projectId}/vaults/${vaultId}/vaults.json`);
    }
    async getVault(projectId, vaultId) {
        return this.request(`/buckets/${projectId}/vaults/${vaultId}.json`);
    }
    async createVault(projectId, parentVaultId, title) {
        return this.request(`/buckets/${projectId}/vaults/${parentVaultId}/vaults.json`, {
            method: 'POST',
            body: JSON.stringify({ title })
        });
    }
    async updateVault(projectId, vaultId, title) {
        return this.request(`/buckets/${projectId}/vaults/${vaultId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ title })
        });
    }
    // Project Templates
    async getTemplates(status) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/templates.json${query}`);
    }
    async getTemplate(templateId) {
        return this.request(`/templates/${templateId}.json`);
    }
    async createTemplate(name, description) {
        return this.request('/templates.json', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
    }
    async updateTemplate(templateId, name, description) {
        return this.request(`/templates/${templateId}.json`, {
            method: 'PUT',
            body: JSON.stringify({ name, description })
        });
    }
    async deleteTemplate(templateId) {
        return this.request(`/templates/${templateId}.json`, {
            method: 'DELETE'
        });
    }
    async createProjectFromTemplate(templateId, name, description) {
        return this.request(`/templates/${templateId}/project_constructions.json`, {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });
    }
    async getProjectConstruction(templateId, constructionId) {
        return this.request(`/templates/${templateId}/project_constructions/${constructionId}.json`);
    }
    // Search
    async getSearchMetadata() {
        return this.request('/searches/metadata.json');
    }
    async search(query, options) {
        const params = new URLSearchParams({ q: query });
        if (options?.type)
            params.append('type', options.type);
        if (options?.bucket_id)
            params.append('bucket_id', options.bucket_id);
        if (options?.creator_id)
            params.append('creator_id', options.creator_id);
        if (options?.file_type)
            params.append('file_type', options.file_type);
        if (options?.exclude_chat)
            params.append('exclude_chat', '1');
        if (options?.page)
            params.append('page', options.page.toString());
        if (options?.per_page)
            params.append('per_page', options.per_page.toString());
        return this.request(`/search.json?${params.toString()}`);
    }
}

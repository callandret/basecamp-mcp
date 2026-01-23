#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { getAccessToken } from './auth.js';
import { BasecampClient } from './basecamp-client.js';
const CLIENT_ID = process.env.BASECAMP_CLIENT_ID;
const CLIENT_SECRET = process.env.BASECAMP_CLIENT_SECRET;
const REDIRECT_URI = process.env.BASECAMP_REDIRECT_URI || 'http://localhost:3000/callback';
const APP_NAME = process.env.BASECAMP_APP_NAME || 'Claude MCP';
const CONTACT_EMAIL = process.env.BASECAMP_CONTACT_EMAIL;
let client;
const server = new Server({
    name: 'basecamp-mcp',
    version: '1.0.0',
    // Server icons belong here in the first argument
    icons: [
        {
            src: 'data:image/png;base64,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',
            mimeType: 'image/png',
            sizes: ['128x128'] // The SDK expects an array of strings here
        }
    ]
}, {
    // The second argument is ONLY for functional capabilities
    capabilities: {
        tools: {}
    }
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'list_projects',
            description: 'List all Basecamp projects',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_project',
            description: 'Get details of a specific project',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' }
                },
                required: ['project_id']
            }
        },
        {
            name: 'create_project',
            description: 'Create a new Basecamp project',
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Project name' },
                    description: { type: 'string', description: 'Project description' }
                },
                required: ['name']
            }
        },
        {
            name: 'get_todo_lists',
            description: 'List to-do lists in a project',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todoset_id: { type: 'string', description: 'The to-do set ID' },
                    status: { type: 'string', description: 'Filter by status (archived/trashed)' }
                },
                required: ['project_id', 'todoset_id']
            }
        },
        {
            name: 'get_todo_list',
            description: 'Get a single to-do list',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todolist_id: { type: 'string', description: 'The to-do list ID' }
                },
                required: ['project_id', 'todolist_id']
            }
        },
        {
            name: 'create_todo_list',
            description: 'Create a new to-do list',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todoset_id: { type: 'string', description: 'The to-do set ID' },
                    name: { type: 'string', description: 'To-do list name' },
                    description: { type: 'string', description: 'To-do list description (supports HTML)' }
                },
                required: ['project_id', 'todoset_id', 'name']
            }
        },
        {
            name: 'update_todo_list',
            description: 'Update a to-do list',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todolist_id: { type: 'string', description: 'The to-do list ID' },
                    name: { type: 'string', description: 'To-do list name' },
                    description: { type: 'string', description: 'To-do list description (supports HTML)' }
                },
                required: ['project_id', 'todolist_id']
            }
        },
        {
            name: 'get_todos',
            description: 'List to-dos in a to-do list',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todolist_id: { type: 'string', description: 'The to-do list ID' },
                    status: { type: 'string', description: 'Filter by status (archived/trashed)' },
                    completed: { type: 'boolean', description: 'Filter by completion status' }
                },
                required: ['project_id', 'todolist_id']
            }
        },
        {
            name: 'get_todo',
            description: 'Get a single to-do',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todo_id: { type: 'string', description: 'The to-do ID' }
                },
                required: ['project_id', 'todo_id']
            }
        },
        {
            name: 'create_todo',
            description: 'Create a new to-do item',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todolist_id: { type: 'string', description: 'The to-do list ID' },
                    content: { type: 'string', description: 'The to-do content' },
                    description: { type: 'string', description: 'Additional notes (supports HTML)' },
                    assignee_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to assign' },
                    completion_subscriber_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to notify on completion' },
                    due_on: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
                    starts_on: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                    notify: { type: 'boolean', description: 'Notify assignees' }
                },
                required: ['project_id', 'todolist_id', 'content']
            }
        },
        {
            name: 'update_todo',
            description: 'Update a to-do item',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todo_id: { type: 'string', description: 'The to-do ID' },
                    content: { type: 'string', description: 'The to-do content' },
                    description: { type: 'string', description: 'Additional notes (supports HTML)' },
                    assignee_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to assign' },
                    completion_subscriber_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to notify on completion' },
                    due_on: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
                    starts_on: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                    notify: { type: 'boolean', description: 'Notify assignees' }
                },
                required: ['project_id', 'todo_id']
            }
        },
        {
            name: 'complete_todo',
            description: 'Mark a to-do as complete',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todo_id: { type: 'string', description: 'The to-do ID' }
                },
                required: ['project_id', 'todo_id']
            }
        },
        {
            name: 'uncomplete_todo',
            description: 'Mark a to-do as incomplete',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todo_id: { type: 'string', description: 'The to-do ID' }
                },
                required: ['project_id', 'todo_id']
            }
        },
        {
            name: 'reposition_todo',
            description: 'Change the position of a to-do in its list',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todo_id: { type: 'string', description: 'The to-do ID' },
                    position: { type: 'number', description: 'New position (1-based index)' }
                },
                required: ['project_id', 'todo_id', 'position']
            }
        },
        {
            name: 'get_todolist_groups',
            description: 'List to-do list groups (sections) within a to-do list',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todolist_id: { type: 'string', description: 'The to-do list ID' },
                    status: { type: 'string', description: 'Filter by status (archived/trashed)' }
                },
                required: ['project_id', 'todolist_id']
            }
        },
        {
            name: 'get_todolist_group',
            description: 'Get a single to-do list group',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    group_id: { type: 'string', description: 'The group ID' }
                },
                required: ['project_id', 'group_id']
            }
        },
        {
            name: 'create_todolist_group',
            description: 'Create a new to-do list group (section) within a to-do list',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todolist_id: { type: 'string', description: 'The to-do list ID' },
                    name: { type: 'string', description: 'Group name' },
                    color: { type: 'string', description: 'Group color (white, red, orange, yellow, green, blue, aqua, purple, gray, pink, brown)' }
                },
                required: ['project_id', 'todolist_id', 'name']
            }
        },
        {
            name: 'reposition_todolist_group',
            description: 'Change the position of a to-do list group',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    group_id: { type: 'string', description: 'The group ID' },
                    position: { type: 'number', description: 'New position (1-based index)' }
                },
                required: ['project_id', 'group_id', 'position']
            }
        },
        {
            name: 'create_message',
            description: 'Post a message to a project message board',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    messageboard_id: { type: 'string', description: 'The message board ID' },
                    subject: { type: 'string', description: 'Message subject' },
                    content: { type: 'string', description: 'Message content (supports HTML)' }
                },
                required: ['project_id', 'messageboard_id', 'subject', 'content']
            }
        },
        {
            name: 'list_people',
            description: 'List all people in the Basecamp account',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_my_profile',
            description: 'Get the current user profile',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'create_comment',
            description: 'Add a comment to any recording (message, to-do, etc.)',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    recording_id: { type: 'string', description: 'The recording ID to comment on' },
                    content: { type: 'string', description: 'Comment content (supports HTML)' }
                },
                required: ['project_id', 'recording_id', 'content']
            }
        },
        {
            name: 'create_schedule_entry',
            description: 'Create a calendar event',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    schedule_id: { type: 'string', description: 'The schedule ID' },
                    summary: { type: 'string', description: 'Event title' },
                    starts_at: { type: 'string', description: 'Start time (ISO 8601)' },
                    ends_at: { type: 'string', description: 'End time (ISO 8601)' },
                    description: { type: 'string', description: 'Event description' },
                    all_day: { type: 'boolean', description: 'Is this an all-day event?' }
                },
                required: ['project_id', 'schedule_id', 'summary', 'starts_at', 'ends_at']
            }
        },
        {
            name: 'get_schedule',
            description: 'Get a schedule',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    schedule_id: { type: 'string', description: 'The schedule ID' }
                },
                required: ['project_id', 'schedule_id']
            }
        },
        {
            name: 'update_schedule',
            description: 'Update schedule settings',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    schedule_id: { type: 'string', description: 'The schedule ID' },
                    include_due_assignments: { type: 'boolean', description: 'Include due dates from to-dos, cards, and steps' }
                },
                required: ['project_id', 'schedule_id', 'include_due_assignments']
            }
        },
        {
            name: 'get_schedule_entries',
            description: 'List schedule entries',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    schedule_id: { type: 'string', description: 'The schedule ID' }
                },
                required: ['project_id', 'schedule_id']
            }
        },
        {
            name: 'get_card_table',
            description: 'Get a card table',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    card_table_id: { type: 'string', description: 'The card table ID' }
                },
                required: ['project_id', 'card_table_id']
            }
        },
        {
            name: 'create_attachment',
            description: 'Upload a file attachment',
            inputSchema: {
                type: 'object',
                properties: {
                    file: { type: 'string', description: 'File content (base64 encoded)' },
                    filename: { type: 'string', description: 'The filename' },
                    content_type: { type: 'string', description: 'MIME type (e.g., image/png)' }
                },
                required: ['file', 'filename', 'content_type']
            }
        },
        {
            name: 'get_documents',
            description: 'List documents in a vault',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    vault_id: { type: 'string', description: 'The vault ID' }
                },
                required: ['project_id', 'vault_id']
            }
        },
        {
            name: 'get_document',
            description: 'Get a single document',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    document_id: { type: 'string', description: 'The document ID' }
                },
                required: ['project_id', 'document_id']
            }
        },
        {
            name: 'create_document',
            description: 'Create a new document',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    vault_id: { type: 'string', description: 'The vault ID' },
                    title: { type: 'string', description: 'Document title' },
                    content: { type: 'string', description: 'Document content (supports HTML)' },
                    status: { type: 'string', description: 'Status (use "active" to publish immediately)' }
                },
                required: ['project_id', 'vault_id', 'title', 'content']
            }
        },
        {
            name: 'update_document',
            description: 'Update a document',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    document_id: { type: 'string', description: 'The document ID' },
                    title: { type: 'string', description: 'Document title' },
                    content: { type: 'string', description: 'Document content (supports HTML)' }
                },
                required: ['project_id', 'document_id']
            }
        },
        {
            name: 'get_uploads',
            description: 'List uploads in a vault',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    vault_id: { type: 'string', description: 'The vault ID' }
                },
                required: ['project_id', 'vault_id']
            }
        },
        {
            name: 'get_upload',
            description: 'Get a single upload',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    upload_id: { type: 'string', description: 'The upload ID' }
                },
                required: ['project_id', 'upload_id']
            }
        },
        {
            name: 'create_upload',
            description: 'Create an upload from an attachment',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    vault_id: { type: 'string', description: 'The vault ID' },
                    attachable_sgid: { type: 'string', description: 'The attachment SGID from create_attachment' },
                    description: { type: 'string', description: 'Upload description' },
                    base_name: { type: 'string', description: 'Rename the file' }
                },
                required: ['project_id', 'vault_id', 'attachable_sgid']
            }
        },
        {
            name: 'update_upload',
            description: 'Update an upload',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    upload_id: { type: 'string', description: 'The upload ID' },
                    description: { type: 'string', description: 'Upload description' },
                    base_name: { type: 'string', description: 'Rename the file' }
                },
                required: ['project_id', 'upload_id']
            }
        },
        {
            name: 'get_message_board',
            description: 'Get a message board',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    message_board_id: { type: 'string', description: 'The message board ID' }
                },
                required: ['project_id', 'message_board_id']
            }
        },
        {
            name: 'get_vaults',
            description: 'List child vaults (folders) within a vault',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    vault_id: { type: 'string', description: 'The parent vault ID' }
                },
                required: ['project_id', 'vault_id']
            }
        },
        {
            name: 'get_vault',
            description: 'Get a single vault (folder)',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    vault_id: { type: 'string', description: 'The vault ID' }
                },
                required: ['project_id', 'vault_id']
            }
        },
        {
            name: 'create_vault',
            description: 'Create a new vault (folder)',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    parent_vault_id: { type: 'string', description: 'The parent vault ID' },
                    title: { type: 'string', description: 'Vault title' }
                },
                required: ['project_id', 'parent_vault_id', 'title']
            }
        },
        {
            name: 'update_vault',
            description: 'Update a vault (folder) title',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    vault_id: { type: 'string', description: 'The vault ID' },
                    title: { type: 'string', description: 'New vault title' }
                },
                required: ['project_id', 'vault_id', 'title']
            }
        },
        {
            name: 'get_templates',
            description: 'List project templates',
            inputSchema: {
                type: 'object',
                properties: {
                    status: { type: 'string', description: 'Filter by status (archived/trashed)' }
                }
            }
        },
        {
            name: 'get_template',
            description: 'Get a single template',
            inputSchema: {
                type: 'object',
                properties: {
                    template_id: { type: 'string', description: 'The template ID' }
                },
                required: ['template_id']
            }
        },
        {
            name: 'create_template',
            description: 'Create a new template',
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Template name' },
                    description: { type: 'string', description: 'Template description' }
                },
                required: ['name']
            }
        },
        {
            name: 'update_template',
            description: 'Update a template',
            inputSchema: {
                type: 'object',
                properties: {
                    template_id: { type: 'string', description: 'The template ID' },
                    name: { type: 'string', description: 'Template name' },
                    description: { type: 'string', description: 'Template description' }
                },
                required: ['template_id']
            }
        },
        {
            name: 'delete_template',
            description: 'Delete a template',
            inputSchema: {
                type: 'object',
                properties: {
                    template_id: { type: 'string', description: 'The template ID' }
                },
                required: ['template_id']
            }
        },
        {
            name: 'create_project_from_template',
            description: 'Create a project from a template',
            inputSchema: {
                type: 'object',
                properties: {
                    template_id: { type: 'string', description: 'The template ID' },
                    name: { type: 'string', description: 'Project name' },
                    description: { type: 'string', description: 'Project description' }
                },
                required: ['template_id', 'name']
            }
        },
        {
            name: 'get_project_construction',
            description: 'Get status of project construction from template',
            inputSchema: {
                type: 'object',
                properties: {
                    template_id: { type: 'string', description: 'The template ID' },
                    construction_id: { type: 'string', description: 'The construction ID' }
                },
                required: ['template_id', 'construction_id']
            }
        },
        {
            name: 'get_messages',
            description: 'List messages on a message board',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    messageboard_id: { type: 'string', description: 'The message board ID' }
                },
                required: ['project_id', 'messageboard_id']
            }
        },
        {
            name: 'get_message',
            description: 'Get a single message',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    message_id: { type: 'string', description: 'The message ID' }
                },
                required: ['project_id', 'message_id']
            }
        },
        {
            name: 'update_message',
            description: 'Update a message',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    message_id: { type: 'string', description: 'The message ID' },
                    subject: { type: 'string', description: 'Message subject' },
                    content: { type: 'string', description: 'Message content (supports HTML)' },
                    category_id: { type: 'number', description: 'Category ID' }
                },
                required: ['project_id', 'message_id']
            }
        },
        {
            name: 'pin_message',
            description: 'Pin a message to the top of the message board',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    message_id: { type: 'string', description: 'The message ID' }
                },
                required: ['project_id', 'message_id']
            }
        },
        {
            name: 'get_comments',
            description: 'List comments on a recording',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    recording_id: { type: 'string', description: 'The recording ID' }
                },
                required: ['project_id', 'recording_id']
            }
        },
        {
            name: 'get_comment',
            description: 'Get a single comment',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    comment_id: { type: 'string', description: 'The comment ID' }
                },
                required: ['project_id', 'comment_id']
            }
        },
        {
            name: 'update_comment',
            description: 'Update a comment',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    comment_id: { type: 'string', description: 'The comment ID' },
                    content: { type: 'string', description: 'Comment content (supports HTML)' }
                },
                required: ['project_id', 'comment_id', 'content']
            }
        },
        {
            name: 'get_recordings',
            description: 'List recordings (messages, to-dos, documents, etc.)',
            inputSchema: {
                type: 'object',
                properties: {
                    type: { type: 'string', description: 'Recording type (Message, Todo, Document, etc.)' },
                    bucket: { type: 'string', description: 'Filter by project ID' },
                    status: { type: 'string', description: 'Filter by status (archived/trashed)' },
                    sort: { type: 'string', description: 'Sort field' },
                    direction: { type: 'string', description: 'Sort direction (asc/desc)' }
                },
                required: ['type']
            }
        },
        {
            name: 'trash_recording',
            description: 'Move a recording to trash',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    recording_id: { type: 'string', description: 'The recording ID' }
                },
                required: ['project_id', 'recording_id']
            }
        },
        {
            name: 'archive_recording',
            description: 'Archive a recording',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    recording_id: { type: 'string', description: 'The recording ID' }
                },
                required: ['project_id', 'recording_id']
            }
        },
        {
            name: 'unarchive_recording',
            description: 'Unarchive a recording',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    recording_id: { type: 'string', description: 'The recording ID' }
                },
                required: ['project_id', 'recording_id']
            }
        },
        {
            name: 'get_schedule_entry',
            description: 'Get a single schedule entry',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    entry_id: { type: 'string', description: 'The schedule entry ID' }
                },
                required: ['project_id', 'entry_id']
            }
        },
        {
            name: 'update_schedule_entry',
            description: 'Update a schedule entry',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    entry_id: { type: 'string', description: 'The schedule entry ID' },
                    summary: { type: 'string', description: 'Event title' },
                    starts_at: { type: 'string', description: 'Start time (ISO 8601)' },
                    ends_at: { type: 'string', description: 'End time (ISO 8601)' },
                    description: { type: 'string', description: 'Event description' },
                    participant_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs of participants' },
                    all_day: { type: 'boolean', description: 'Is this an all-day event?' },
                    notify: { type: 'boolean', description: 'Notify participants' }
                },
                required: ['project_id', 'entry_id']
            }
        },
        {
            name: 'get_cards',
            description: 'List cards in a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' }
                },
                required: ['project_id', 'column_id']
            }
        },
        {
            name: 'get_card',
            description: 'Get a single card',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    card_id: { type: 'string', description: 'The card ID' }
                },
                required: ['project_id', 'card_id']
            }
        },
        {
            name: 'create_card',
            description: 'Create a new card in a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' },
                    title: { type: 'string', description: 'Card title' },
                    content: { type: 'string', description: 'Card content (supports HTML)' },
                    due_on: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
                    assignee_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to assign' },
                    notify: { type: 'boolean', description: 'Notify assignees' }
                },
                required: ['project_id', 'column_id', 'title']
            }
        },
        {
            name: 'update_card',
            description: 'Update a card',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    card_id: { type: 'string', description: 'The card ID' },
                    title: { type: 'string', description: 'Card title' },
                    content: { type: 'string', description: 'Card content (supports HTML)' },
                    due_on: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
                    assignee_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to assign' }
                },
                required: ['project_id', 'card_id']
            }
        },
        {
            name: 'get_column',
            description: 'Get a card table column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' }
                },
                required: ['project_id', 'column_id']
            }
        },
        {
            name: 'create_column',
            description: 'Create a new column in a card table',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    card_table_id: { type: 'string', description: 'The card table ID' },
                    title: { type: 'string', description: 'Column title' },
                    description: { type: 'string', description: 'Column description' }
                },
                required: ['project_id', 'card_table_id', 'title']
            }
        },
        {
            name: 'update_column',
            description: 'Update a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' },
                    title: { type: 'string', description: 'Column title' },
                    description: { type: 'string', description: 'Column description' }
                },
                required: ['project_id', 'column_id']
            }
        },
        {
            name: 'move_column',
            description: 'Move a column to a new position',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    card_table_id: { type: 'string', description: 'The card table ID' },
                    source_id: { type: 'string', description: 'The column ID to move' },
                    target_id: { type: 'string', description: 'The target column ID' },
                    position: { type: 'string', description: 'Position relative to target (before/after)' }
                },
                required: ['project_id', 'card_table_id', 'source_id', 'target_id']
            }
        },
        {
            name: 'change_column_color',
            description: 'Change the color of a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' },
                    color: { type: 'string', description: 'Color (e.g., blue, red, green, yellow, orange, purple, pink)' }
                },
                required: ['project_id', 'column_id', 'color']
            }
        },
        {
            name: 'subscribe_to_column',
            description: 'Subscribe to notifications for a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' }
                },
                required: ['project_id', 'column_id']
            }
        },
        {
            name: 'unsubscribe_from_column',
            description: 'Unsubscribe from notifications for a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' }
                },
                required: ['project_id', 'column_id']
            }
        },
        {
            name: 'enable_on_hold',
            description: 'Enable on-hold status for a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' }
                },
                required: ['project_id', 'column_id']
            }
        },
        {
            name: 'disable_on_hold',
            description: 'Disable on-hold status for a column',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    column_id: { type: 'string', description: 'The column ID' }
                },
                required: ['project_id', 'column_id']
            }
        },
        {
            name: 'create_step',
            description: 'Create a step on a card',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    card_id: { type: 'string', description: 'The card ID' },
                    title: { type: 'string', description: 'Step title' },
                    due_on: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
                    assignee_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to assign' }
                },
                required: ['project_id', 'card_id', 'title']
            }
        },
        {
            name: 'update_step',
            description: 'Update a step',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    step_id: { type: 'string', description: 'The step ID' },
                    title: { type: 'string', description: 'Step title' },
                    due_on: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
                    assignee_ids: { type: 'array', items: { type: 'number' }, description: 'User IDs to assign' }
                },
                required: ['project_id', 'step_id']
            }
        },
        {
            name: 'complete_step',
            description: 'Mark a step as complete or incomplete',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    step_id: { type: 'string', description: 'The step ID' },
                    completed: { type: 'boolean', description: 'Completion status' }
                },
                required: ['project_id', 'step_id', 'completed']
            }
        },
        {
            name: 'reposition_step',
            description: 'Change the position of a step',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    card_id: { type: 'string', description: 'The card ID' },
                    source_id: { type: 'string', description: 'The step ID to move' },
                    position: { type: 'number', description: 'New position (1-based index)' }
                },
                required: ['project_id', 'card_id', 'source_id', 'position']
            }
        },
        {
            name: 'get_all_campfires',
            description: 'List all campfires (chats)',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_campfire',
            description: 'Get a single campfire (chat)',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    chat_id: { type: 'string', description: 'The chat ID' }
                },
                required: ['project_id', 'chat_id']
            }
        },
        {
            name: 'get_campfire_lines',
            description: 'List messages in a campfire',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    chat_id: { type: 'string', description: 'The chat ID' }
                },
                required: ['project_id', 'chat_id']
            }
        },
        {
            name: 'get_campfire_line',
            description: 'Get a single campfire message',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    chat_id: { type: 'string', description: 'The chat ID' },
                    line_id: { type: 'string', description: 'The line ID' }
                },
                required: ['project_id', 'chat_id', 'line_id']
            }
        },
        {
            name: 'create_campfire_line',
            description: 'Post a message to a campfire',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    chat_id: { type: 'string', description: 'The chat ID' },
                    content: { type: 'string', description: 'Message content' }
                },
                required: ['project_id', 'chat_id', 'content']
            }
        },
        {
            name: 'delete_campfire_line',
            description: 'Delete a campfire message',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    chat_id: { type: 'string', description: 'The chat ID' },
                    line_id: { type: 'string', description: 'The line ID' }
                },
                required: ['project_id', 'chat_id', 'line_id']
            }
        },
        {
            name: 'get_questionnaire',
            description: 'Get a questionnaire',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    questionnaire_id: { type: 'string', description: 'The questionnaire ID' }
                },
                required: ['project_id', 'questionnaire_id']
            }
        },
        {
            name: 'get_questions',
            description: 'List questions in a questionnaire',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    questionnaire_id: { type: 'string', description: 'The questionnaire ID' }
                },
                required: ['project_id', 'questionnaire_id']
            }
        },
        {
            name: 'get_question',
            description: 'Get a single question',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    question_id: { type: 'string', description: 'The question ID' }
                },
                required: ['project_id', 'question_id']
            }
        },
        {
            name: 'get_question_answers',
            description: 'List answers to a question',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    question_id: { type: 'string', description: 'The question ID' }
                },
                required: ['project_id', 'question_id']
            }
        },
        {
            name: 'get_question_answer',
            description: 'Get a single question answer',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    answer_id: { type: 'string', description: 'The answer ID' }
                },
                required: ['project_id', 'answer_id']
            }
        },
        {
            name: 'get_todoset',
            description: 'Get a to-do set',
            inputSchema: {
                type: 'object',
                properties: {
                    project_id: { type: 'string', description: 'The project ID' },
                    todoset_id: { type: 'string', description: 'The to-do set ID' }
                },
                required: ['project_id', 'todoset_id']
            }
        },
        {
            name: 'get_search_metadata',
            description: 'Get search metadata including available types and creators',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'search',
            description: 'Search across Basecamp',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Search query' },
                    type: { type: 'string', description: 'Filter by type (Message, Todo, Document, etc.)' },
                    bucket_id: { type: 'string', description: 'Filter by project ID' },
                    creator_id: { type: 'string', description: 'Filter by creator user ID' },
                    file_type: { type: 'string', description: 'Filter by file type' },
                    exclude_chat: { type: 'boolean', description: 'Exclude chat messages from results' },
                    page: { type: 'number', description: 'Page number for pagination' },
                    per_page: { type: 'number', description: 'Results per page' }
                },
                required: ['query']
            }
        }
    ]
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    const a = args;
    try {
        let result;
        switch (name) {
            case 'list_projects':
                result = await client.listProjects();
                break;
            case 'get_project':
                result = await client.getProject(a.project_id);
                break;
            case 'create_project':
                result = await client.createProject(a.name, a.description);
                break;
            case 'get_todo_lists':
                result = await client.getTodoLists(a.project_id, a.todoset_id, a.status);
                break;
            case 'get_todo_list':
                result = await client.getTodoList(a.project_id, a.todolist_id);
                break;
            case 'create_todo_list':
                result = await client.createTodoList(a.project_id, a.todoset_id, a.name, a.description);
                break;
            case 'update_todo_list':
                result = await client.updateTodoList(a.project_id, a.todolist_id, a.name, a.description);
                break;
            case 'get_todos':
                result = await client.getTodos(a.project_id, a.todolist_id, a.status, a.completed);
                break;
            case 'get_todo':
                result = await client.getTodo(a.project_id, a.todo_id);
                break;
            case 'create_todo':
                result = await client.createTodo(a.project_id, a.todolist_id, a.content, {
                    description: a.description,
                    assignee_ids: a.assignee_ids,
                    completion_subscriber_ids: a.completion_subscriber_ids,
                    due_on: a.due_on,
                    starts_on: a.starts_on,
                    notify: a.notify
                });
                break;
            case 'update_todo':
                result = await client.updateTodo(a.project_id, a.todo_id, {
                    content: a.content,
                    description: a.description,
                    assignee_ids: a.assignee_ids,
                    completion_subscriber_ids: a.completion_subscriber_ids,
                    due_on: a.due_on,
                    starts_on: a.starts_on,
                    notify: a.notify
                });
                break;
            case 'complete_todo':
                result = await client.completeTodo(a.project_id, a.todo_id);
                break;
            case 'uncomplete_todo':
                result = await client.uncompleteTodo(a.project_id, a.todo_id);
                break;
            case 'reposition_todo':
                result = await client.repositionTodo(a.project_id, a.todo_id, a.position);
                break;
            case 'get_todolist_groups':
                result = await client.getTodoListGroups(a.project_id, a.todolist_id, a.status);
                break;
            case 'get_todolist_group':
                result = await client.getTodoListGroup(a.project_id, a.group_id);
                break;
            case 'create_todolist_group':
                result = await client.createTodoListGroup(a.project_id, a.todolist_id, a.name, a.color);
                break;
            case 'reposition_todolist_group':
                result = await client.repositionTodoListGroup(a.project_id, a.group_id, a.position);
                break;
            case 'create_message':
                result = await client.createMessage(a.project_id, a.messageboard_id, a.subject, a.content);
                break;
            case 'list_people':
                result = await client.listPeople();
                break;
            case 'get_my_profile':
                result = await client.getMe();
                break;
            case 'create_comment':
                result = await client.createComment(a.project_id, a.recording_id, a.content);
                break;
            case 'create_schedule_entry':
                result = await client.createScheduleEntry(a.project_id, a.schedule_id, a.summary, {
                    starts_at: a.starts_at,
                    ends_at: a.ends_at,
                    description: a.description,
                    all_day: a.all_day
                });
                break;
            case 'get_schedule':
                result = await client.getSchedule(a.project_id, a.schedule_id);
                break;
            case 'update_schedule':
                result = await client.updateSchedule(a.project_id, a.schedule_id, a.include_due_assignments);
                break;
            case 'get_schedule_entries':
                result = await client.getScheduleEntries(a.project_id, a.schedule_id);
                break;
            case 'get_card_table':
                result = await client.getCardTable(a.project_id, a.card_table_id);
                break;
            case 'create_attachment':
                const fileBuffer = Buffer.from(a.file, 'base64');
                result = await client.createAttachment(fileBuffer, a.filename, a.content_type, fileBuffer.length);
                break;
            case 'get_documents':
                result = await client.getDocuments(a.project_id, a.vault_id);
                break;
            case 'get_document':
                result = await client.getDocument(a.project_id, a.document_id);
                break;
            case 'create_document':
                result = await client.createDocument(a.project_id, a.vault_id, a.title, a.content, a.status);
                break;
            case 'update_document':
                result = await client.updateDocument(a.project_id, a.document_id, a.title, a.content);
                break;
            case 'get_uploads':
                result = await client.getUploads(a.project_id, a.vault_id);
                break;
            case 'get_upload':
                result = await client.getUpload(a.project_id, a.upload_id);
                break;
            case 'create_upload':
                result = await client.createUpload(a.project_id, a.vault_id, a.attachable_sgid, {
                    description: a.description,
                    base_name: a.base_name
                });
                break;
            case 'update_upload':
                result = await client.updateUpload(a.project_id, a.upload_id, {
                    description: a.description,
                    base_name: a.base_name
                });
                break;
            case 'get_message_board':
                result = await client.getMessageBoard(a.project_id, a.message_board_id);
                break;
            case 'get_vaults':
                result = await client.getVaults(a.project_id, a.vault_id);
                break;
            case 'get_vault':
                result = await client.getVault(a.project_id, a.vault_id);
                break;
            case 'create_vault':
                result = await client.createVault(a.project_id, a.parent_vault_id, a.title);
                break;
            case 'update_vault':
                result = await client.updateVault(a.project_id, a.vault_id, a.title);
                break;
            case 'get_templates':
                result = await client.getTemplates(a.status);
                break;
            case 'get_template':
                result = await client.getTemplate(a.template_id);
                break;
            case 'create_template':
                result = await client.createTemplate(a.name, a.description);
                break;
            case 'update_template':
                result = await client.updateTemplate(a.template_id, a.name, a.description);
                break;
            case 'delete_template':
                result = await client.deleteTemplate(a.template_id);
                break;
            case 'create_project_from_template':
                result = await client.createProjectFromTemplate(a.template_id, a.name, a.description);
                break;
            case 'get_project_construction':
                result = await client.getProjectConstruction(a.template_id, a.construction_id);
                break;
            case 'get_messages':
                result = await client.getMessages(a.project_id, a.messageboard_id);
                break;
            case 'get_message':
                result = await client.getMessage(a.project_id, a.message_id);
                break;
            case 'update_message':
                result = await client.updateMessage(a.project_id, a.message_id, a.subject, a.content, a.category_id);
                break;
            case 'pin_message':
                result = await client.pinMessage(a.project_id, a.message_id);
                break;
            case 'get_comments':
                result = await client.getComments(a.project_id, a.recording_id);
                break;
            case 'get_comment':
                result = await client.getComment(a.project_id, a.comment_id);
                break;
            case 'update_comment':
                result = await client.updateComment(a.project_id, a.comment_id, a.content);
                break;
            case 'get_recordings':
                result = await client.getRecordings(a.type, {
                    bucket: a.bucket,
                    status: a.status,
                    sort: a.sort,
                    direction: a.direction
                });
                break;
            case 'trash_recording':
                result = await client.trashRecording(a.project_id, a.recording_id);
                break;
            case 'archive_recording':
                result = await client.archiveRecording(a.project_id, a.recording_id);
                break;
            case 'unarchive_recording':
                result = await client.unarchiveRecording(a.project_id, a.recording_id);
                break;
            case 'get_schedule_entry':
                result = await client.getScheduleEntry(a.project_id, a.entry_id);
                break;
            case 'update_schedule_entry':
                result = await client.updateScheduleEntry(a.project_id, a.entry_id, {
                    summary: a.summary,
                    starts_at: a.starts_at,
                    ends_at: a.ends_at,
                    description: a.description,
                    participant_ids: a.participant_ids,
                    all_day: a.all_day,
                    notify: a.notify
                });
                break;
            case 'get_cards':
                result = await client.getCards(a.project_id, a.column_id);
                break;
            case 'get_card':
                result = await client.getCard(a.project_id, a.card_id);
                break;
            case 'create_card':
                result = await client.createCard(a.project_id, a.column_id, a.title, {
                    content: a.content,
                    due_on: a.due_on,
                    assignee_ids: a.assignee_ids,
                    notify: a.notify
                });
                break;
            case 'update_card':
                result = await client.updateCard(a.project_id, a.card_id, {
                    title: a.title,
                    content: a.content,
                    due_on: a.due_on,
                    assignee_ids: a.assignee_ids
                });
                break;
            case 'get_column':
                result = await client.getColumn(a.project_id, a.column_id);
                break;
            case 'create_column':
                result = await client.createColumn(a.project_id, a.card_table_id, a.title, a.description);
                break;
            case 'update_column':
                result = await client.updateColumn(a.project_id, a.column_id, a.title, a.description);
                break;
            case 'move_column':
                result = await client.moveColumn(a.project_id, a.card_table_id, a.source_id, a.target_id, a.position);
                break;
            case 'change_column_color':
                result = await client.changeColumnColor(a.project_id, a.column_id, a.color);
                break;
            case 'subscribe_to_column':
                result = await client.subscribeToColumn(a.project_id, a.column_id);
                break;
            case 'unsubscribe_from_column':
                result = await client.unsubscribeFromColumn(a.project_id, a.column_id);
                break;
            case 'enable_on_hold':
                result = await client.enableOnHold(a.project_id, a.column_id);
                break;
            case 'disable_on_hold':
                result = await client.disableOnHold(a.project_id, a.column_id);
                break;
            case 'create_step':
                result = await client.createStep(a.project_id, a.card_id, a.title, {
                    due_on: a.due_on,
                    assignee_ids: a.assignee_ids
                });
                break;
            case 'update_step':
                result = await client.updateStep(a.project_id, a.step_id, {
                    title: a.title,
                    due_on: a.due_on,
                    assignee_ids: a.assignee_ids
                });
                break;
            case 'complete_step':
                result = await client.completeStep(a.project_id, a.step_id, a.completed);
                break;
            case 'reposition_step':
                result = await client.repositionStep(a.project_id, a.card_id, a.source_id, a.position);
                break;
            case 'get_all_campfires':
                result = await client.getAllCampfires();
                break;
            case 'get_campfire':
                result = await client.getCampfire(a.project_id, a.chat_id);
                break;
            case 'get_campfire_lines':
                result = await client.getCampfireLines(a.project_id, a.chat_id);
                break;
            case 'get_campfire_line':
                result = await client.getCampfireLine(a.project_id, a.chat_id, a.line_id);
                break;
            case 'create_campfire_line':
                result = await client.createCampfireLine(a.project_id, a.chat_id, a.content);
                break;
            case 'delete_campfire_line':
                result = await client.deleteCampfireLine(a.project_id, a.chat_id, a.line_id);
                break;
            case 'get_questionnaire':
                result = await client.getQuestionnaire(a.project_id, a.questionnaire_id);
                break;
            case 'get_questions':
                result = await client.getQuestions(a.project_id, a.questionnaire_id);
                break;
            case 'get_question':
                result = await client.getQuestion(a.project_id, a.question_id);
                break;
            case 'get_question_answers':
                result = await client.getQuestionAnswers(a.project_id, a.question_id);
                break;
            case 'get_question_answer':
                result = await client.getQuestionAnswer(a.project_id, a.answer_id);
                break;
            case 'get_todoset':
                result = await client.getTodoset(a.project_id, a.todoset_id);
                break;
            case 'get_search_metadata':
                result = await client.getSearchMetadata();
                break;
            case 'search':
                result = await client.search(a.query, {
                    type: a.type,
                    bucket_id: a.bucket_id,
                    creator_id: a.creator_id,
                    file_type: a.file_type,
                    exclude_chat: a.exclude_chat,
                    page: a.page,
                    per_page: a.per_page
                });
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
            isError: true
        };
    }
});
// Main entry point
async function main() {
    // Authenticate and create client
    const tokens = await getAccessToken(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    client = new BasecampClient(tokens.access_token, tokens.account_id, APP_NAME, CONTACT_EMAIL);
    // Start the MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Basecamp MCP server running');
}
main().catch(console.error);

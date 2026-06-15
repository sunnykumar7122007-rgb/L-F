// messaging.js - Frontend messaging feature
// -------------------------------------------------
// This script implements a professional, invitation‑only messaging system.
// Users can send text, images, and voice recordings. Voice recordings first request
// microphone permission, record audio, upload to Supabase Storage, then send as a
// message payload.

// NOTE: This script assumes the existence of the supabaseDB object defined in
// supabase.js and the HTML layout already present in index.html under the
// #tab-messages section.

(() => {
  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  const state = {
    currentUser: null, // will be set from localStorage/user session
    invitations: [], // pending invitation objects { id, sender_id, sender_name }
    conversations: [], // conversation objects { id, participant_id, name }
    activeConversation: null, // conversation id
    mediaRecorder: null,
    recordedChunks: [],
  };

  // ---------------------------------------------------------------------
  // Utility helpers
  // ---------------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const showToast = (msg, type = 'info') => {
    const container = $('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // ---------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------
  const initMessaging = async () => {
    // Load current user from localStorage (same pattern as other modules)
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      state.currentUser = JSON.parse(stored);
    } else {
      console.warn('No logged‑in user for messaging');
    }
    // Load pending invitations & conversations
    await loadInvitations();
    await loadConversations();
    // Bind UI events
    bindUIEvents();
  };

  // ---------------------------------------------------------------------
  // Invitation handling
  // ---------------------------------------------------------------------
  const loadInvitations = async () => {
    // For demo purposes we fetch from a Supabase view "message_invitations"
    // expecting columns: id, sender_id, sender_name, receiver_id, status
    if (!state.currentUser) return;
    const client = _getClient();
    const { data, error } = await client
      .from('message_invitations')
      .select('id, sender_id, sender_name')
      .eq('receiver_id', state.currentUser.id)
      .eq('status', 'pending');
    if (error) {
      console.error('Failed to load invitations', error);
      return;
    }
    state.invitations = data || [];
    renderInvitations();
  };

  const renderInvitations = () => {
    const list = $('#invitations-list');
    if (!list) return;
    list.innerHTML = '';
    if (state.invitations.length === 0) {
      list.innerHTML = '<p class="empty-text">No pending chat invitations.</p>';
      return;
    }
    state.invitations.forEach((inv) => {
      const card = document.createElement('div');
      card.className = 'invitation-card';
      card.innerHTML = `
        <div class="invitation-info">
          <span class="inviter-name">${inv.sender_name}</span>
          <span class="invitation-action">
            <button class="btn btn-success btn-sm" data-inv-id="${inv.id}" data-action="accept">Accept</button>
            <button class="btn btn-danger btn-sm" data-inv-id="${inv.id}" data-action="decline">Decline</button>
          </span>
        </div>`;
      list.appendChild(card);
    });
  };

  const respondToInvitation = async (invId, accept) => {
    const client = _getClient();
    const { error } = await client
      .from('message_invitations')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', invId);
    if (error) {
      console.error('Invitation response failed', error);
      showToast('Failed to update invitation', 'error');
      return;
    }
    // Refresh lists
    await loadInvitations();
    if (accept) await loadConversations();
    showToast(accept ? 'Invitation accepted' : 'Invitation declined', 'info');
  };

  // ---------------------------------------------------------------------
  // Conversation handling
  // ---------------------------------------------------------------------
  const loadConversations = async () => {
    if (!state.currentUser) return;
    const client = _getClient();
    const { data, error } = await client
      .from('messages')
      .select('conversation_id, sender_id, receiver_id')
      .or(`sender_id.eq.${state.currentUser.id},receiver_id.eq.${state.currentUser.id}`)
      .group('conversation_id');
    if (error) {
      console.error('Failed to load conversations', error);
      return;
    }
    // Derive unique conversation ids and partner details
    const convIds = new Set();
    data.forEach((row) => convIds.add(row.conversation_id));
    // For simplicity, fetch partner info from users table
    const convArray = [];
    for (const convId of convIds) {
      const { data: msgs } = await client.from('messages').select('sender_id, receiver_id').eq('conversation_id', convId).limit(1);
      const otherId = msgs[0].sender_id === state.currentUser.id ? msgs[0].receiver_id : msgs[0].sender_id;
      const { data: users } = await client.from('users').select('name').eq('id', otherId).single();
      convArray.push({ id: convId, participant_id: otherId, name: users?.name || 'Unknown' });
    }
    state.conversations = convArray;
    renderConversations();
  };

  const renderConversations = () => {
    const list = $('#conversations-list');
    if (!list) return;
    list.innerHTML = '';
    if (state.conversations.length === 0) {
      list.innerHTML = '<p class="empty-text">No conversations yet. Invite someone!</p>';
      return;
    }
    state.conversations.forEach((conv) => {
      const card = document.createElement('div');
      card.className = 'conversation-card';
      card.dataset.convId = conv.id;
      card.innerHTML = `
        <div class="conv-avatar"><i class="fa-solid fa-user"></i></div>
        <div class="conv-info">
          <h5 class="conv-name">${conv.name}</h5>
          <span class="conv-id" style="display:none;">${conv.id}</span>
        </div>`;
      list.appendChild(card);
    });
  };

  const openConversation = async (convId) => {
    state.activeConversation = convId;
    // Show chat panel
    $('#chat-panel').style.display = 'flex';
    // Load partner name
    const conv = state.conversations.find((c) => c.id === convId);
    $('#chat-partner-name').textContent = conv?.name || 'Chat';
    // Load messages
    await loadMessages(convId);
  };

  const loadMessages = async (convId) => {
    const client = _getClient();
    const { data, error } = await client
      .from('messages')
      .select('id, sender_id, text, media_url, media_type, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Failed to load messages', error);
      return;
    }
    renderMessages(data);
  };

  const renderMessages = (messages) => {
    const container = $('#chat-messages');
    if (!container) return;
    container.innerHTML = '';
    messages.forEach((msg) => {
      const isOwn = msg.sender_id === state.currentUser.id;
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${isOwn ? 'own' : 'incoming'}`;
      let content = '';
      if (msg.text) content += `<p class="msg-text">${msg.text}</p>`;
      if (msg.media_url) {
        if (msg.media_type === 'image') {
          content += `<img src="${msg.media_url}" class="msg-image" alt="sent image"/>`;
        } else if (msg.media_type === 'voice') {
          content += `<audio controls src="${msg.media_url}" class="msg-audio"></audio>`;
        }
      }
      bubble.innerHTML = content;
      container.appendChild(bubble);
    });
    // Auto‑scroll to bottom
    container.scrollTop = container.scrollHeight;
  };

  // ---------------------------------------------------------------------
  // Sending messages
  // ---------------------------------------------------------------------
  const sendTextMessage = async () => {
    const txt = $('#chat-input').value.trim();
    if (!txt) return;
    const payload = {
      conversation_id: state.activeConversation,
      sender_id: state.currentUser.id,
      receiver_id: getConversationPartnerId(),
      text: txt,
    };
    await supabaseDB.sendMessage(payload);
    $('#chat-input').value = '';
    await loadMessages(state.activeConversation);
  };

  const getConversationPartnerId = () => {
    const conv = state.conversations.find((c) => c.id === state.activeConversation);
    return conv?.participant_id;
  };

  // Image upload flow
  const handleImageSelection = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const path = `conversations/${state.activeConversation}`;
    const url = await supabaseDB.uploadMedia(file, path);
    const payload = {
      conversation_id: state.activeConversation,
      sender_id: state.currentUser.id,
      receiver_id: getConversationPartnerId(),
      media_url: url,
      media_type: 'image',
    };
    await supabaseDB.sendMessage(payload);
    await loadMessages(state.activeConversation);
  };

  // Voice recording flow
  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Microphone not supported', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.mediaRecorder = new MediaRecorder(stream);
      state.recordedChunks = [];
      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) state.recordedChunks.push(e.data);
      };
      state.mediaRecorder.onstop = uploadVoiceRecording;
      state.mediaRecorder.start();
      $('#voice-record-btn').classList.add('recording');
    } catch (err) {
      console.error('Microphone permission denied', err);
      showToast('Microphone permission denied', 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }
    $('#voice-record-btn').classList.remove('recording');
  };

  const uploadVoiceRecording = async () => {
    const blob = new Blob(state.recordedChunks, { type: 'audio/webm' });
    const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
    const path = `conversations/${state.activeConversation}`;
    const url = await supabaseDB.uploadMedia(file, path);
    const payload = {
      conversation_id: state.activeConversation,
      sender_id: state.currentUser.id,
      receiver_id: getConversationPartnerId(),
      media_url: url,
      media_type: 'voice',
    };
    await supabaseDB.sendMessage(payload);
    await loadMessages(state.activeConversation);
  };

  // ---------------------------------------------------------------------
  // UI event binding
  // ---------------------------------------------------------------------
  const bindUIEvents = () => {
    // Invitation accept/decline
    $('#invitations-list')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-inv-id]');
      if (!btn) return;
      const invId = btn.dataset.invId;
      const action = btn.dataset.action;
      respondToInvitation(invId, action === 'accept');
    });

    // Open conversation on click
    $('#conversations-list')?.addEventListener('click', (e) => {
      const card = e.target.closest('.conversation-card');
      if (!card) return;
      const convId = card.dataset.convId;
      openConversation(convId);
    });

    // Send text on button or Enter
    $('#chat-send-btn')?.addEventListener('click', sendTextMessage);
    $('#chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendTextMessage();
      }
    });

    // Image selection trigger (we attach to hidden file input)
    const imgInput = document.createElement('input');
    imgInput.type = 'file';
    imgInput.accept = 'image/*';
    imgInput.style.display = 'none';
    imgInput.addEventListener('change', handleImageSelection);
    document.body.appendChild(imgInput);
    $('#chat-image-btn')?.addEventListener('click', () => imgInput.click());

    // Voice recording button (toggle)
    const voiceBtn = $('#voice-record-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('mousedown', startVoiceRecording);
      voiceBtn.addEventListener('mouseup', stopVoiceRecording);
      voiceBtn.addEventListener('touchstart', startVoiceRecording);
      voiceBtn.addEventListener('touchend', stopVoiceRecording);
    }

    // Close chat panel
    $('#chat-back-btn')?.addEventListener('click', () => {
      $('#chat-panel').style.display = 'none';
      state.activeConversation = null;
    });
  };

  // ---------------------------------------------------------------------
  // Kickoff
  // ---------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', initMessaging);
})();

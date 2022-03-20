#!/bin/bash
tmux new-session -d -n "Cartas contra la Obesidad"
tmux split-window -h
tmux send-keys -t 0 "cd backend && npm start" Enter
tmux send-keys -t 1 "cd frontend && npm run dev" Enter
tmux -2 attach-session -d

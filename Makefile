SHELL := /bin/bash
.DEFAULT_GOAL := help

ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
ENV_FILE := $(ROOT)/.make.env

-include $(ENV_FILE)

HOST ?= 0.0.0.0

.PHONY: help context ports config-check preflight-ports install typecheck lint format dev dev-app dev-server

help:
	@echo "Daidalon — façade locale par worktree"
	@echo "  make ports                 afficher et valider le couple de ports"
	@echo "  make context               afficher racine, branche et révision"
	@echo "  make preflight-ports       vérifier les listeners sans les toucher"
	@echo "  make dev-app               lancer Vite avec le backend configuré"
	@echo "  make dev-server            lancer opencode serve sur le port configuré"
	@echo "  make dev                   lancer UI et backend, avec arrêt coordonné"
	@echo "  DRY_RUN=1 make dev         afficher les commandes sans lancer de serveur"
	@echo "  make install|typecheck|lint|format"
	@echo "  Configuration locale : .make.env (copier .make.env.example)"

define PORT_PRECHECK
for port in $(1); do \
	if lsof -nP -iTCP:$$port -sTCP:LISTEN >/dev/null 2>&1; then \
		echo "Error: port $$port is already listening; no process was stopped" >&2; \
		lsof -nP -iTCP:$$port -sTCP:LISTEN; \
		exit 1; \
	fi; \
done;
endef

config-check:
	@test -f "$(ENV_FILE)" || { echo "Error: missing $(ENV_FILE); copy .make.env.example to .make.env" >&2; exit 1; }
	@test -n "$(WORKTREE_CODE)" -a -n "$(BACKEND_PORT)" -a -n "$(UI_PORT)" || { echo "Error: .make.env must define WORKTREE_CODE, BACKEND_PORT and UI_PORT" >&2; exit 1; }
	@case "$(WORKTREE_CODE)" in *[!0-9]*|'') echo "Error: WORKTREE_CODE must be numeric" >&2; exit 1;; esac
	@case "$(BACKEND_PORT):$(UI_PORT)" in *[!0-9:]*|:*) echo "Error: BACKEND_PORT and UI_PORT must be numeric" >&2; exit 1;; esac
	@expected_ui=$$((6400 + 10#$(WORKTREE_CODE))); expected_backend=$$((6400 + 10#$(WORKTREE_CODE) + 2)); test "$(BACKEND_PORT)" = "$$expected_backend" -a "$(UI_PORT)" = "$$expected_ui" || { echo "Error: code $(WORKTREE_CODE) requires backend=$$expected_backend ui=$$expected_ui" >&2; exit 1; }

context: config-check
	@echo "root=$(ROOT)"
	@echo "branch=$$(git -C "$(ROOT)" branch --show-current)"
	@echo "head=$$(git -C "$(ROOT)" rev-parse --short HEAD)"
	@echo "worktree_code=$(WORKTREE_CODE)"

ports: config-check
	@echo "worktree_code=$(WORKTREE_CODE) backend=http://$(HOST):$(BACKEND_PORT) ui=http://$(HOST):$(UI_PORT)"

preflight-ports: config-check
	@$(call PORT_PRECHECK,$(BACKEND_PORT) $(UI_PORT))
	@echo "Ports available: backend=$(BACKEND_PORT) ui=$(UI_PORT)"

install:
	@cd "$(ROOT)" && bun install --frozen-lockfile

typecheck:
	@cd "$(ROOT)/packages/app" && bun typecheck
	@cd "$(ROOT)/packages/opencode" && bun typecheck

lint:
	@cd "$(ROOT)" && bun run lint

format:
	@cd "$(ROOT)" && bunx prettier --check docs/product/worktrees.md

dev-app: config-check
	@if [ "$(DRY_RUN)" = "1" ]; then \
		echo "DRY-RUN VITE_OPENCODE_SERVER_HOST=$(HOST) VITE_OPENCODE_SERVER_PORT=$(BACKEND_PORT) bun --cwd $(ROOT)/packages/app run dev -- --host $(HOST) --port $(UI_PORT) --strictPort"; \
	else \
		$(call PORT_PRECHECK,$(UI_PORT)) \
		cd "$(ROOT)/packages/app" && VITE_OPENCODE_SERVER_HOST="$(HOST)" VITE_OPENCODE_SERVER_PORT="$(BACKEND_PORT)" bun run dev -- --host "$(HOST)" --port "$(UI_PORT)" --strictPort; \
	fi

dev-server: config-check
	@if [ "$(DRY_RUN)" = "1" ]; then \
		echo "DRY-RUN bun --cwd $(ROOT)/packages/opencode run ./src/index.ts serve --hostname $(HOST) --port $(BACKEND_PORT)"; \
	else \
		$(call PORT_PRECHECK,$(BACKEND_PORT)) \
		cd "$(ROOT)/packages/opencode" && bun run ./src/index.ts serve --hostname "$(HOST)" --port "$(BACKEND_PORT)"; \
	fi

dev: config-check
	@if [ "$(DRY_RUN)" = "1" ]; then \
		echo "DRY-RUN coordinated children: make dev-server and make dev-app"; \
		cd "$(ROOT)" && make --no-print-directory DRY_RUN=1 dev-server; \
		cd "$(ROOT)" && make --no-print-directory DRY_RUN=1 dev-app; \
	else \
		$(call PORT_PRECHECK,$(BACKEND_PORT) $(UI_PORT)) \
		app_pid=; server_pid=; \
		is_running() { ps -p "$$1" -o stat= 2>/dev/null | tr -d ' ' | grep -qv '^Z'; }; \
		cleanup() { \
			trap - INT TERM EXIT; \
			for pid in "$$server_pid" "$$app_pid"; do is_running "$$pid" && kill "$$pid" 2>/dev/null || true; done; \
			wait "$$server_pid" 2>/dev/null || true; \
			wait "$$app_pid" 2>/dev/null || true; \
		}; \
		trap 'cleanup; exit 130' INT TERM; \
		trap cleanup EXIT; \
		(cd "$(ROOT)/packages/opencode" && exec bun ./src/index.ts serve --hostname "$(HOST)" --port "$(BACKEND_PORT)") & server_pid=$$!; \
		(cd "$(ROOT)/packages/app" && exec env VITE_OPENCODE_SERVER_HOST="$(HOST)" VITE_OPENCODE_SERVER_PORT="$(BACKEND_PORT)" "$(ROOT)/packages/app/node_modules/.bin/vite" --host "$(HOST)" --port "$(UI_PORT)" --strictPort) & app_pid=$$!; \
		while is_running "$$server_pid" && is_running "$$app_pid"; do sleep 0.1; done; \
		status=0; \
		if ! is_running "$$server_pid"; then wait "$$server_pid" || status=$$?; else wait "$$app_pid" || status=$$?; fi; \
		cleanup; \
		exit "$$status"; \
	fi

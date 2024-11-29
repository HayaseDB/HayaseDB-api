.PHONY: up down dev prod docker-setup docker-rebuild build migrate migrate-force logs backup restore help


ifneq (,$(wildcard ./.env))
    include .env
    export
endif

COLOR_RESET = \033[0m
COLOR_BOLD = \033[1m
COLOR_BLACK = \033[30m
COLOR_WHITE = \033[97m
COLOR_BLUE = \033[34m
COLOR_GREEN = \033[32m
COLOR_RED = \033[31m
COLOR_YELLOW = \033[33m

help:
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)======================$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)   MAKE COMMANDS HELP   $(COLOR_RESET)"
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)======================$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BLUE)1. DEVELOPMENT$(COLOR_RESET)"
	@echo "$(COLOR_BLUE)--------------------$(COLOR_RESET)"
	@echo "  $(COLOR_GREEN)make dev$(COLOR_RESET)         : Starts the application in development mode using nodemon."
	@echo "  $(COLOR_GREEN)make prod$(COLOR_RESET)        : Starts the application in production mode."
	@echo ""
	@echo "$(COLOR_BLUE)2. MIGRATIONS$(COLOR_RESET)"
	@echo "$(COLOR_BLUE)-----------------------$(COLOR_RESET)"
	@echo "  $(COLOR_GREEN)make migrate$(COLOR_RESET)      : Runs database migrations."
	@echo "  $(COLOR_GREEN)make migrate-force$(COLOR_RESET): Forces running all migrations, even if already applied."
	@echo ""
	@echo "$(COLOR_BLUE)3. DATABASE BACKUP AND RESTORE$(COLOR_RESET)"
	@echo "$(COLOR_BLUE)-------------------------------$(COLOR_RESET)"
	@echo "  $(COLOR_GREEN)make backup$(COLOR_RESET)       : Creates a backup of the PostgreSQL database."
	@echo "  $(COLOR_GREEN)make restore$(COLOR_RESET)      : Restores the PostgreSQL database from a backup file."
	@echo ""

up:
	@docker-compose -f docker-compose.yml up

prod:
	@docker-compose -f docker-compose.prod.yml up

down:
	@docker-compose down

destroy:
	@echo "Stopping all Docker containers, removing volumes, and networks for this project..."
	@docker-compose stop > /dev/null 2>&1
	@docker-compose down --volumes --remove-orphans --rmi local
	@docker-compose stop > /dev/null 2>&1
	@docker-compose down --volumes --remove-orphans --rmi local
	@make log-destroy

setup:
	@echo "Setting up Docker containers for development..."
	@docker-compose -f docker-compose.yml up --build

rebuild:
	@echo "Rebuilding Docker containers..."
	@docker-compose -f docker-compose.yml up -d --build --force-recreate

backup:
	@echo "Creating a backup of the PostgreSQL database..."
	@PGPASSWORD=$(PGPASSWORD) pg_dump -h $(PGHOST) -U $(PGUSER) -F c -b -v -f backup/$(shell date +%Y%m%d%H%M%S)_backup.dump $(PGDATABASE)

restore:
	@echo "Restoring the PostgreSQL database from a backup..."
	@read -p "Enter the backup filename: " filename; \
	PGPASSWORD=$(PGPASSWORD) pg_restore -h $(PGHOST) -U $(PGUSER) -d $(PGDATABASE) -v backup/$$filename


log-destroy:
	@echo ""
	@echo "$(COLOR_BG_RED)$(COLOR_WHITE)  DESTROY  $(COLOR_RESET) Environment destroyed"
	@echo " ╠══ Containers  All containers stopped and removed"
	@echo " ╠══ Volumes     All volumes removed"
	@echo " ╚══ Networks    All networks cleaned up"
	@echo ""

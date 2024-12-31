.PHONY: up down dev prod setup rebuild destroy logs backup restore help

ifneq (,$(wildcard .env))
    include .env
    export
endif

ifneq (,$(shell which tput))
    COLOR_RESET  = $(shell tput sgr0)
    COLOR_BOLD   = $(shell tput bold)
    COLOR_BLACK  = $(shell tput setaf 0)
    COLOR_WHITE  = $(shell tput setaf 7)
    COLOR_BLUE   = $(shell tput setaf 4)
    COLOR_GREEN  = $(shell tput setaf 2)
    COLOR_RED    = $(shell tput setaf 1)
    COLOR_YELLOW = $(shell tput setaf 3)
else
    COLOR_RESET  =
    COLOR_BOLD   =
    COLOR_BLACK  =
    COLOR_WHITE  =
    COLOR_BLUE   =
    COLOR_GREEN  =
    COLOR_RED    =
    COLOR_YELLOW =
endif

help:
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)======================$(COLOR_RESET)"
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)   MAKE COMMANDS HELP   $(COLOR_RESET)"
	@echo "$(COLOR_BOLD)$(COLOR_YELLOW)======================$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BLUE)1. DEVELOPMENT$(COLOR_RESET)"
	@echo "  $(COLOR_GREEN)make dev$(COLOR_RESET)         : Start development environment."
	@echo "  $(COLOR_GREEN)make prod$(COLOR_RESET)        : Start production environment."
	@echo ""
	@echo "$(COLOR_BLUE)2. ENVIRONMENT CONTROL$(COLOR_RESET)"
	@echo "  $(COLOR_GREEN)make down$(COLOR_RESET)        : Stop the currently active environment."
	@echo "  $(COLOR_GREEN)make destroy$(COLOR_RESET)     : Stop and remove all containers, volumes, and networks."
	@echo "  $(COLOR_GREEN)make setup$(COLOR_RESET)       : Build and start the environment."
	@echo "  $(COLOR_GREEN)make rebuild$(COLOR_RESET)     : Rebuild and recreate containers."
	@echo ""
	@echo "$(COLOR_BLUE)3. DATABASE$(COLOR_RESET)"
	@echo "  $(COLOR_GREEN)make backup$(COLOR_RESET)      : Backup the database."
	@echo "  $(COLOR_GREEN)make restore$(COLOR_RESET)     : Restore the database from a backup."
	@echo ""

dev:
	@docker-compose -f docker-compose.dev.yml up

prod:
	@docker-compose -f docker-compose.yml up

down-dev:
	@echo "Stopping the development environment..."
	@docker-compose -f docker-compose.dev.yml down

down-prod:
	@echo "Stopping the production environment..."
	@docker-compose -f docker-compose.yml down

destroy-dev:
	@echo "Stopping and removing all containers, volumes, and networks for the development environment..."
	@docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans --rmi local
	@make log-destroy

destroy-prod:
	@echo "Stopping and removing all containers, volumes, and networks for the production environment..."
	@docker-compose -f docker-compose.yml down --volumes --remove-orphans --rmi local
	@make log-destroy


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
	@echo "$(COLOR_BOLD)$(COLOR_RED)  DESTROY   Environment cleaned up$(COLOR_RESET)"
	@echo " ╠══ Containers  All containers stopped and removed"
	@echo " ╠══ Volumes     All volumes removed"
	@echo " ╚══ Networks    All networks cleaned up"
	@echo ""

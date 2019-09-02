FROM gitpod/workspace-full-vnc:latest

# Install custom tools, runtime, etc.
RUN apt-get update \
    # window manager
    && apt-get install -y jwm \
    # vscode
    && apt-get install -y libx11-dev libxkbfile-dev libsecret-1-dev libgconf-2-4 libnss3 libgtk-3-dev libasound2-dev twm \
    && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

USER gitpod
# Apply user-specific settings
RUN bash -c ". .nvm/nvm.sh \
    && nvm install 10 \
    && nvm use 10 \
    && npm install -g yarn"

# Give back control
USER root

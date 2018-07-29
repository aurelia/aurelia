FROM circleci/node:8.11.3-browsers

RUN sudo npm i -g npm istanbul aurelia-cli http-server codecov

RUN sudo apt-get update
RUN sudo apt-get install --only-upgrade -y firefox
RUN sudo apt-get install -y wget
RUN sudo wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN sudo dpkg -i google-chrome-stable_current_amd64.deb; sudo apt-get -fy install
RUN sudo rm google-chrome-stable_current_amd64.deb
RUN sudo apt-get clean

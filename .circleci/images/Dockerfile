FROM circleci/node:8.11.3-browsers

RUN sudo npm i -g npm@6.2.0 istanbul

RUN sudo wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN sudo dpkg -i google-chrome-stable_current_amd64.deb; sudo apt-get -fy install

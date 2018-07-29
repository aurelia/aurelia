FROM circleci/node:8.11.3-browsers

RUN sudo npm i -g npm istanbul aurelia-cli http-server codecov protractor
RUN sudo webdriver-manager update

RUN sudo apt-get update
RUN sudo apt-get install -y wget tar
RUN sudo wget -O FirefoxSetup.tar.bz2 "https://download.mozilla.org/?product=firefox-latest&os=linux64&lang=en-US"
RUN sudo rm -rf /opt/firefox && sudo mkdir /opt/firefox && sudo chmod -R 777 /opt/firefox
RUN sudo tar xjf FirefoxSetup.tar.bz2 -C /opt/firefox/
RUN sudo rm FirefoxSetup.tar.bz2
RUN sudo wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN sudo dpkg -i google-chrome-stable_current_amd64.deb; sudo apt-get -fy install
RUN sudo rm google-chrome-stable_current_amd64.deb
RUN sudo apt-get clean

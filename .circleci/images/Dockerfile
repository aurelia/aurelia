FROM circleci/node:8.11.3-browsers

RUN sudo chown -R circleci /usr/local

RUN npm i -g npm
RUN npm i -g istanbul aurelia-cli http-server codecov protractor
RUN webdriver-manager update

RUN sudo apt-get update
RUN sudo apt-get install -y wget tar

RUN wget -O ~/FirefoxSetup.tar.bz2 "https://download.mozilla.org/?product=firefox-latest&os=linux64&lang=en-US"
RUN sudo rm -rf /opt/firefox && sudo rm -rf /opt/firefox && sudo mkdir /opt/firefox && sudo chown -R circleci /opt/firefox
RUN tar xjf ~/FirefoxSetup.tar.bz2 -C /opt/firefox/
RUN rm ~/FirefoxSetup.tar.bz2

RUN wget -O ~/ChromeSetup.deb "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"
RUN sudo dpkg -i ~/ChromeSetup.deb; sudo apt-get -fy install
RUN rm ~/ChromeSetup.deb

RUN sudo apt-get clean

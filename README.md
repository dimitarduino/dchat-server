# Семинарска работа: Веб chat апликација (MERN STACK): Серверски дел
Клиентскиот дел на апликацијата може да се најди на следниот линк: https://github.com/dimitarduino/dchat-client

# Хостинг (Серверски дел)
Покрај начинот за локално стартување на апликацијата, апликацијата е хостирана со автоматски deploy (при commit во master, автоматски се обновува најновата верзија) на линкот: https://dchat-backend.herokuapp.com/
Исто така хостирана е и на dockerhub: https://hub.docker.com/r/dimitarduino/dchat-server

# Постапки во терминал за старт на серверскиот дел
1. git clone https://github.com/dimitarduino/dchat-server
2. cd dchat-server
3. npm install
4. docker-compose up -d - Стартува mongo-express (порт: 8081), Стартува mongo (порт: 27017)
5. npm start (node server) / nodemon server


# Објаснување за работа на апликацијата
1. Серверскиот дел има 4 routes (usersRoute - автентикација на корисник (jwt), registerRoute - додавање/читање на членови, groupsRoute - читање, додавање, променување на групи и messagesRoute - читање, додавање на пораки)
2. Базата се користи на порт 27017 доколку е локално, ако е на хостинг се користи монго атлас (база на cloud) што е запишана како ATLAS_URI env променлива во хостингот (heroku). Доколку се стартува локално, линкот од базата со потребните информации може да се стави во .env фајл запишан во променлива: ATLAS_URI
3. Проектот се стартува по default на порт 5000. Целата контрола со веб сокетите (listeners, emitters) е запишана во server.js и е ставена на порт 8000.
4. Рутите се наоѓаат во фолдерот routes, моделите се наоѓаат во фолдерот models
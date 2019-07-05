// server and app files are separeted because of TDD. TDD does not need a server to run, just instanciate a App class.
import app from './app';

app.listen(3003);

import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import sinonChai = require("sinon-chai");

before(() => {
    chai.use(chaiAsPromised);
    chai.use(sinonChai);
});

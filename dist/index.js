"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActionHandler = exports.Handler = void 0;
class Handler {
    constructor(props) {
        this.props = props;
    }
    input(schema) {
        return new Handler({
            schema,
            parser: this.props.parser,
        });
    }
    procedure(callback) {
        const schema = this.props.schema;
        if (!schema)
            throw new Error("zod schema must be provided");
        return (formData) => __awaiter(this, void 0, void 0, function* () {
            const output = this.props.parser.execute(schema, formData);
            try {
                const response = yield callback(output);
                return {
                    data: response,
                    error: null,
                };
            }
            catch (error) {
                return {
                    data: null,
                    error: error.message,
                };
            }
        });
    }
}
exports.Handler = Handler;
class Parser {
    execute(schema, formData) {
        const formValues = this.parseFormData(formData);
        return schema.parse(formValues);
    }
    parseFormData(formData) {
        let obj = {};
        formData.forEach((value, key) => {
            Object.defineProperty(obj, key, {
                value: value.toString(),
                writable: true,
            });
        });
        return obj;
    }
}
const createActionHandler = () => {
    return new Handler({
        schema: null,
        parser: new Parser(),
    });
};
exports.createActionHandler = createActionHandler;

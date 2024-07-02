const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

// const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


/* SIMULACIÓN DE CONSUMO DE API */
//Trae la parte de final de cada mensaje
const finMensaje = [
    '0 - Para volver al menú',
    'Chau - Para terminar la conversación'
];

//Trae los mensajes dependiendo de los subflujos
async function mensSub(flujo, mensaje) {
    try {
        var response = "";
        switch (flujo) {

            case 3:
                switch (mensaje) {
                    case 1:
                        response = "Opción 1";
                        break;
                    case 2:
                        response = "Opción 2";
                    default:
                        break;
                }
                break;

            default:
                response = "Ha ocurrido un error, por favor inténtelo más tarde";
                break;
        }
        return response;
    } catch (err) {
        console.log("ERROR MENU:", err);
        return err;
    }
}

//Trae los mensajes dependiendo de los flujos
async function mens(flujo, mensaje) {
    try {
        var response = "";
        switch (flujo) {
            case 0:
                switch (mensaje) {
                    case 1:
                        response = "Hola! Te has comunicado con el bot de @deportiva.mza NUEVO";
                        break;
                    case 2:
                        response = "🤖 Por favor, selecciona una opción: \n\n1- Ver catálogo 📝\n2- Nuestras redes 🌐\n3- Preguntas frecuentes ℹ️\n4- Hablar con un representante☎️\n\n_Para terminar la conversación escribe chau 😊_";
                        break;
                    default:
                        break;
                }

                break;
            case 1:
                switch (mensaje) {
                    case 1:
                        response = "🙌 Acá está el catálogo que estamos constantemente actualizando:";
                        break;
                    case 2:
                        response = "https://drive.google.com/file/d/1tsOfIyB4fhu0zd5bKvNTJ9aa5jDGLC7D/view?usp=drivesdk";
                    default:
                        break;
                }
                break;
            case 2:
                switch (mensaje) {
                    case 1:
                        response = "Nuestras redes";
                        break;
                    case 2:
                        response = "Instagram: https://www.instagram.com/deportiva.mza?igsh=dW44ZGd0MXBtZ2Nz";
                        break;
                    default:
                        break;
                }
                break;
            case 3:
                switch (mensaje) {
                    case 1:
                        response = "*Preguntas frecuentes*\n1-De donde son las calzas?\n2-Qué talles abarcan S, M, L?";
                        break;
                    default:
                        break;
                }
                break;
            case 4:
                switch (mensaje) {
                    case 1:
                        response = "Aguarde un momento, en breve se comunicará uno de nuestros representantes...\nPara terminar la conversación con el representante escribe 'chau'";
                        break;
                    default:
                        break;
                }
                break;
            case 100://Despedida
                switch (mensaje) {
                    case 1:
                        response = "Gracias por comunicarte con @deportiva.mza\nRecuerda consultar nuestras redes para no perderte ninguna novedad!";
                        break;
                    default:
                        break;
                }
                break;
            default:
                response = "Ha ocurrido un error, por favor inténtelo más tarde";
                break;
        }
        return response;
    } catch (err) {
        console.log("ERROR MENU:", err);
        return err;
    }
}
/* FIN SIMULACIÓN DE CONSUMO DE API */


//FLUJOS
const flowCuatro = addKeyword(['4'])
    .addAction({ capture: false },
        async (ctx, { fallBack, flowDynamic }) => {
            const response = await mens(4, 1);
            await flowDynamic(response)
        })
    .addAction(
        { capture: true, delay: 700 },
        // Handler de la respuesta
        async (ctx, { fallBack, flowDynamic, gotoFlow, endFlow, state }) => {
            try {
                //--------------ADIÓS--------------
                //Trae el mensaje y lo pasa a minusculas
                const mensaje = ctx.body.toString().toLowerCase();
                if (mensaje == "chau" || mensaje == "adios") {
                    // Saludo final
                    const saludoFinal = await mens(100, 1);
                    await flowDynamic(saludoFinal);
                    return endFlow();
                } else if (mensaje == "0") {
                    return gotoFlow(flowMenu)
                } else {
                    return fallBack()
                }


            } catch (error) {

                // Retorna el error por el body y por consola.
                console.log("Error en el FlowDos", error);
                await flowDynamic([{ body: "Ocurrio un error, por favor intentalo de nuevo" }]);
                return fallBack();
            }
        },
        // Flujos de submenú
        []
    )

const flowTres = addKeyword(['3'])
    .addAction({ capture: false },
        async (ctx, { fallBack, flowDynamic, gotoFlow, endFlow }) => {
            const response = await mens(3, 1);
            await flowDynamic(response)
        })
    .addAnswer(
        finMensaje,
        { capture: true },
        // Handler de la respuesta
        async (ctx, { fallBack, flowDynamic, gotoFlow, endFlow }) => {
            try {

                //--------------ADIÓS--------------
                //Trae el mensaje y lo pasa a minusculas
                const mensaje = ctx.body.toString().toLowerCase();
                if (mensaje == "chau" || mensaje == "adios") {
                    // Saludo final
                    const saludoFinal = await mens(100, 1);
                    await flowDynamic(saludoFinal);
                    return endFlow();
                } else if (mensaje == "0") {
                    return gotoFlow(flowMenu)
                }

                //--------------SUBFLUJOS--------------
                // Convertimos el mensaje en un número
                const msg = parseInt(ctx.body.toLowerCase().trim());
                console.log("Flujo menu", msg)
                var response = ""
                switch (msg) {
                    case 1:
                        response = await mensSub(3, 1);
                        await flowDynamic(response);
                        return gotoFlow(flowTres);
                    case 2:
                        response = await mensSub(3, 2);
                        await flowDynamic(response);
                        return gotoFlow(flowTres);
                    default:
                        // Si el número no es válido, mostramos un mensaje de error
                        await flowDynamic([
                            { body: 'Opción no válida, por favor seleccione una opción válida.' }
                        ]);
                        return fallBack();
                }
            } catch (error) {

                // Retorna el error por el body y por consola.
                console.log("Error en el FlowTres", error);
                await flowDynamic([{ body: "Ocurrio un error, por favor intentalo de nuevo" }]);
                return fallBack();
            }
        },
        // Flujos de submenú
        []
    )

const flowDos = addKeyword(['2'])
    .addAction({ capture: false },
        async (ctx, { fallBack, flowDynamic }) => {
            const response = await mens(2, 1);
            await flowDynamic(response)
        })
    .addAction({ capture: false },
        async (ctx, { fallBack, flowDynamic }) => {
            const response = await mens(2, 2);
            await flowDynamic(response)
        })
    .addAnswer(
        finMensaje,
        { capture: true, delay: 700 },
        // Handler de la respuesta
        async (ctx, { fallBack, flowDynamic, gotoFlow, endFlow }) => {
            try {

                //--------------ADIÓS--------------
                //Trae el mensaje y lo pasa a minusculas
                const mensaje = ctx.body.toString().toLowerCase();
                if (mensaje == "chau" || mensaje == "adios") {
                    // Saludo final
                    const saludoFinal = await mens(100, 1);
                    await flowDynamic(saludoFinal);
                    return endFlow();
                } else if (mensaje == "0") {
                    return gotoFlow(flowMenu)
                }


            } catch (error) {

                // Retorna el error por el body y por consola.
                console.log("Error en el FlowDos", error);
                await flowDynamic([{ body: "Ocurrio un error, por favor intentalo de nuevo" }]);
                return fallBack();
            }
        },
        // Flujos de submenú
        []
    )

const flowUno = addKeyword(['1'])
    .addAction({ capture: false },
        async (_, { flowDynamic }) => {
            const response = await mens(1, 1);
            await flowDynamic(response)
        })
    .addAction({ capture: false },
        async (_, { flowDynamic }) => {
            const response = await mens(1, 2);
            await flowDynamic(response)
        })
    .addAnswer(
        finMensaje,
        { capture: true, delay: 700 },
        // Handler de la respuesta
        async (ctx, { fallBack, flowDynamic, gotoFlow, endFlow }) => {
            try {

                //--------------ADIÓS--------------
                //Trae el mensaje y lo pasa a minusculas
                const mensaje = ctx.body.toString().toLowerCase();
                if (mensaje == "chau" || mensaje == "adios") {
                    // Saludo final
                    const saludoFinal = await mens(100, 1);
                    await flowDynamic(saludoFinal);
                    return endFlow();
                } else if (mensaje == "0") {
                    return gotoFlow(flowMenu)
                }


            } catch (error) {

                // Retorna el error por el body y por consola.
                console.log("Error en el FlowUno", error);
                await flowDynamic([{ body: "Ocurrio un error, por favor intentalo de nuevo" }]);
                return fallBack();
            }
        },
        // Flujos de submenú
        []
    )

const flowMenu = addKeyword(EVENTS.ACTION)
    .addAction({ capture: false },
        async (_, { flowDynamic }) => {

            const response = await mens(0, 2);
            await flowDynamic(response)

        })
    .addAction({ capture: true, delay: 700 },
        // Handler de la respuesta
        async (ctx, { fallBack, flowDynamic, endFlow }) => {
            try {

                //--------------ADIÓS--------------
                //Trae el mensaje y lo pasa a minusculas
                const adios = ctx.body.toString().toLowerCase();
                if (adios == "chau" || adios == "adios") {
                    // Saludo final
                    const saludoFinal = await mens(100, 1);
                    await flowDynamic(saludoFinal);
                    return endFlow();
                }
                // Convertimos el mensaje en un número
                const msg = parseInt(ctx.body.toLowerCase().trim());
                console.log("Flujo menu", msg)
                // Si el número es válido, lo pasamos al flujo correspondiente
                if (msg >= 1 && msg <= 4) {
                    return;
                }

                // Si el número no es válido, mostramos un mensaje de error
                await flowDynamic([
                    { body: 'Opción no válida, por favor seleccione una opción válida.' }
                ]);
                return fallBack();

            } catch (error) {

                // Retorna el error por el body y por consola.
                console.log("Error en el FlowMenú", error);
                await flowDynamic([{ body: "Ocurrio un error, por favor intentalo de nuevo" }]);
                return fallBack();
            }
        },
        null,
        null,
        // Flujos de submenú
        [flowUno, flowDos, flowTres, flowCuatro]
    )

// Flow bienvenida
const flowBienvenida = addKeyword(EVENTS.WELCOME)
    .addAction(
        { capture: false },
        async (ctx, { gotoFlow, flowDynamic, fallBack, state }) => {
            try {
                console.log(`NUMERO DEL TELEFONO DEL USUARIO: ${ctx.from}`) // Número del teléfono del usuario
                // Bienvenida desde base de datos
                const response = await mens(0, 1);
                // Mensaje de bienvenida por chat
                await flowDynamic(response)
                // Después de la presentación enviamos al flujo de saludo
                return gotoFlow(flowMenu)
            } catch (error) {
                console.log(error);
                await flowDynamic([{ body: "Ocurrió un error, por favor inténtalo de nuevo" }]);
                return fallBack();
            }
        }
    )


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowBienvenida, flowMenu, flowUno, flowDos, flowTres, flowCuatro]) // Para que el gotoFlow funcione, deben crearse los flows acá
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    // QRPortalWeb() *Comentado para que no siga generando qr luego de establecer la conexión*
}

main()

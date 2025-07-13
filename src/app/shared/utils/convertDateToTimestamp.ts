import moment from 'moment';

/**
 * Convierte una cadena de fecha (en formato YYYY-MM-DD) a un timestamp,
 * representando el inicio del día en la zona horaria local del usuario.
 * @param dateString La cadena de fecha en formato "YYYY-MM-DD".
 * @returns Timestamp en milisegundos, o null si la fecha es inválida.
 */
export async function convertDateToTimestamp(dateString: any): Promise<number | null> {
    if (typeof dateString !== 'string') {
        console.error("convertDateToTimestamp espera una cadena de fecha.");
        return null;
    }

    const momentDate = moment(dateString).startOf('day');

    if (!momentDate.isValid()) {
        console.error(`La cadena de fecha "${dateString}" no pudo ser parseada como YYYY-MM-DD.`);
        return null;
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Zona horaria del usuario (nombre IANA):", userTimeZone);
    return momentDate.valueOf();
}

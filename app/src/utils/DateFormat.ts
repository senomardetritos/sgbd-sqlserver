const locale = 'pt-BR';

export function dateFormat(date: string) {
    const myDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    };
    const dateFormatter = new Intl.DateTimeFormat(locale, options);
    return dateFormatter.format(myDate);
}

export function dateTimeFormat(date: string) {
    const myDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const dateFormatter = new Intl.DateTimeFormat(locale, options);
    return dateFormatter.format(myDate);
}

export function dateTimeToDB(date: string) {
    return date.split('T').join(' ')
}
global.global_variants_field_types = {
	text: {
		view_text: 'text',
		view_edit: 'input_text'
	},
	tel: {
		view_text: 'phone_format',
		view_edit: 'input_mask_phone'
	},
	password: {
		view_text: false,
		view_edit: 'input_new_password'
	},
	textarea: {
		view_text: 'prev_text(300)',
		view_edit: 'textarea'
	},
	date: {
		view_text: 'date(d.m.Y)',
		view_edit: 'input_date(Y-m-d)'
	},
	datetime: {
		view_text: 'date(H:i - d.m.Y)',
		view_edit: 'input_datetime'
	},
	date_sql: {
		view_text: 'replace("/(\\d{4})-(\\d{2})-(\\d{2})/", "$3.$2.$1")',
		view_edit: 'input_text'
	},
	number: {
		view_text: 'text',
		view_edit: 'input_number'
	},
	double: {
		view_text: 'text',
		view_edit: 'input_float'
	},
	color: {
		view_text: 'text',
		view_edit: 'input_color'
	},
	time: {
		view_text: 'text',
		view_edit: 'input_time'
	},
	email: {
		view_text: 'text',
		view_edit: 'input_email'
	},
	img: {
		view_text: 'img',
		view_edit: false
	},
	file: {
		view_text: false,
		view_edit: false
	},
	url: {
		view_text: 'text',
		view_edit: 'input_url'
	},
	select: {
		view_text: 'select',
		view_edit: 'options'
	},
	checkbox: {
		view_text: 'checkbox',
		view_edit: 'input_checkbox'
	},
	edit: {
		view_text: false,
		view_edit: false
	},
	elements: {
		view_text: false,
		view_edit: false
	},
	radio: {
		view_text: false,
		view_edit: false
	}
};

global.config_decode = string => {
	let config = {};

	string.split("\n")
	.map(x => x.split(':')
	.map(x => x.trim()))
	.forEach(el => {
		if(! empty(el[0]) && ! /^#/.test(el[0])) {

			let value = el[1].split('#')[0].trim();

			let data_keys = el[0].split('.');

			let result_keys = config;

			asyncForeach(data_keys, (value_key, index) => {
				if(index < data_keys.length -1) {
					if(empty(result_keys[value_key])) {
						result_keys[value_key] = {};
					}
					result_keys = result_keys[value_key];
					// console.log('rr=>', index, data_keys.length, value_key);
				} else {
					// console.log('rr_end=>', index, data_keys.length, value_key);
					if(! empty(value_key)) {
						result_keys[value_key] = value || '';
					} else {
						result_keys = value || '';
					}
				}
			})

		}
	})

	return config;
}

global.empty = var_data => {
	return typeof var_data === 'undefined'
	|| var_data === undefined
	|| var_data === ""
	|| var_data === 0
	|| var_data === "0"
	|| var_data === null
	|| var_data === false
	|| (Array.isArray(var_data)
		&& var_data.length === 0
	) ? true : false
		;
}


global.isset = var_data => var_data !== null && typeof var_data !== 'undefined' ? true : false;
global.is_object = object => !! object && object.constructor === Object;
global.is_array = array => Array.isArray(array);
global.in_array = (value, array) => Array.isArray(array) && array.indexOf(value) >= 0 ? true : false;

/**
 * функция возвращает список id элементов которые нужно добавить и удалить
 * @param type $this_elements - массив текущих элементов
 * @param type $need_elements - массив нужных элементов
 * @return array
 */
global.this_need = (this_elements = [], need_elements = []) => {
	if(!(isset(this_elements) && isset(need_elements) && Array.isArray(this_elements) && Array.isArray(need_elements))) {
		return null;
	}

	let obj = {
			del: [],
			add: []
		}
	;

	this_elements.forEach(el => {
		if(need_elements.indexOf(el) === -1) {
			if(! empty(el)) {
				obj.del.push(el);
			}
		}
	});

	need_elements.forEach(el => {
		if(this_elements.indexOf(el) === -1) {
			if(! empty(el)) {
				obj.add.push(el);
			}
		}
	});

	return obj;
}

global.object_to_array = object => {
	let arr = [];
	for(let p in object) {
		arr.push({key: p, val: object[p]})
	}
	return arr;
}
global.promise_recurs = (array, func, iters = 0) => {
	return new Promise((r, r2) => {
		func(array[iters], iters, r, r2);
	})
	.then(() => {
		if(array.length <= iters) {
			return;
		} else {
			return promise_recurs(array, func, ++iters)
		}
	})
	.catch(error => new Error(error))
}


global.asyncForeach = async (iters, func) => {
	if(! empty(iters)) {
		for(let key in iters) {
			if (func[Symbol.toStringTag] === 'AsyncFunction') {
				await func(iters[key], key);
			} else {
				func(iters[key], key);
			}
		}
	}
}
global.forIn = (iters, func) => {
	if(! empty(iters)) {
		for(let key in iters) {
			func(iters[key], key);
		}
	}
}

global.gen_uid = () => {
	S4 = () => ((( 1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
global.time = () => {
	let t = (new Date()).getTime() / 1000;
	t = t - (t % 1);
	return t;
}



global.date = (format, timestamp) => {
	let t = empty(timestamp) && timestamp !== 0 ? new Date() : new Date(timestamp * 1000),
		arr = [],
		zero = value => value < 10 ? '0' + value : value,
		a,b,c,d,e,f,m,w
	;

	for (let i = 0; i < format.length; i ++) {
		arr[i] = format.substr(i, 1);
		switch (arr[i]) {
			case 'd':
				arr[i] = zero(t.getDate());
				break;
			case 'D':
				let wShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
				arr[i] = wShort[t.getDay()];
				break;
			case 'j':
				arr[i] = t.getDate();
				break;
			case 'l':
				let wFull = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
				arr[i] = wFull[t.getDay()];
				break;
			case 'N':
				arr[i] = t.getDay() || 7;
				break;
			case 'S':
				let S = ['st', 'nd', 'rd', 'th'],
					s = t.getDate() - 1;
				arr[i] = s > 3 ? S[3] : S[s];
				break;
			case 'w':
				arr[i] = t.getDay();
				break;

			case 'z':
				a = t.getFullYear()
				b = new Date(a, t.getMonth(), t.getDate())
				c = new Date(a, 0, 1)

				arr[i] = Math.round((b - c) / 86400000);
				break;
			case 'W':
				a = new Date(t.getFullYear(), t.getMonth(), t.getDate() - t.getDay() + 3)
				b = new Date(a.getFullYear(), 0, 4)

				arr[i] = zero(1 + Math.round((a - b) / 86400000 / 7));
				break;
			case 'F':
				let mFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
				arr[i] = mFull[t.getMonth()];
				break;
			case 'm':
				arr[i] = zero(t.getMonth() + 1);
				break;
			case 'M':
				let mShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				arr[i] = mShort[t.getMonth()];
				break;
			case 'n':
				arr[i] = t.getMonth() + 1;
				break;
			case 't':
				let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				arr[i] = days[t.getMonth()];
				break;
			case 'L':
				a = t.getFullYear();
				arr[i] = a % 4 === 0 & a % 100 !== 0 | a % 400 === 0;
				break;
			case 'o':
				a = t.getFullYear()
				b = t.getMonth() + 1
				c = new Date(a, t.getMonth(), t.getDate() - t.getDay() + 3)
				d = new Date(c.getFullYear(), 0, 4)
				e = zero(1 + Math.round((c - d) / 86400000 / 7))

				arr[i] = a + (b === 12 && e < 9 ? 1 : e === 1 && e > 9 ? -1 : 0);
				break;
			case 'Y':
				arr[i] = t.getFullYear();
				break;
			case 'y':
				arr[i] = String(t.getFullYear()).slice(-2);
				break;
			case 'a':
				arr[i] = t.getHours() > 11 ? 'pm' : 'am';
				break;
			case 'A':
				arr[i] = t.getHours() > 11 ? 'PM' : 'AM';
				break;
			case 'B':
				a = t.getUTCHours() * 3600
				b = t.getUTCMinutes() * 60
				c = t.getUTCSeconds()

				arr[i] = zero(Math.floor((a + b + c + 3600) / 86.4) % 1000, 3);
				break;
			case 'g':
				arr[i] = t.getHours() % 12 || 12;
				break;
			case 'G':
				arr[i] = t.getHours();
				break;
			case 'h':
				arr[i] = zero(t.getHours() % 12 || 12);
				break;
			case 'H':
				arr[i] = zero(t.getHours());
				break;
			case 'i':
				arr[i] = zero(t.getMinutes());
				break;
			case 's':
				arr[i] = zero(t.getSeconds());
				break;
			case 'u':
				a = String(t.getMilliseconds() * 1000);

				while (a.length < 6) {
					a = '0' + a;
				}

				arr[i] = a;
				break;
			case 'e':
				break;
			case 'I':
				a = t.getFullYear()
				b = new Date(a, 0)
				c = Date.UTC(a, 0)
				d = new Date(a, 6)
				e = Date.UTC(a, 6)

				arr[i] = ((b - c) !== (d - e)) ? 1 : 0;
				break;
			case 'O':
				a = t.getTimezoneOffset()
				b = Math.abs(a)
				c = String(Math.floor(b / 60) * 100 + b % 60, 4)

				while (c.length < 4) {
					c = '0' + c;
				}

				arr[i] = (a > 0 ? '-' : '+') + c;
				break;
			case 'P':
				a = t.getTimezoneOffset()
				b = Math.abs(a)
				c = String(Math.floor(b / 60) * 100 + b % 60, 4)

				while (c.length < 4) {
					c = '0' + c;
				}

				d = (a > 0 ? '-' : '+') + c;

				arr[i] = d.substr(0, 3) + ':' + d.substr(3, 2);
				break;
			case 'T':
				arr[i] = 'UTC';
				break;
			case 'Z':
				arr[i] = -t.getTimezoneOffset() * 60;
				break;
			case 'c':
				a = t.getTimezoneOffset()
				b = Math.abs(a)
				c = String(Math.floor(b / 60) * 100 + b % 60, 4)

				while (c.length < 4) {
					c = '0' + c;
				}

				d = (a > 0 ? '-' : '+') + c
				e = d.substr(0, 3) + ':' + d.substr(3, 2)

				arr[i] = t.getFullYear() + '-' + zero(t.getMonth() + 1) + '-' + zero(t.getDate()) + 'T' + zero(t.getHours()) + ':' + zero(t.getMinutes()) + ':' + zero(t.getSeconds()) + e;
				break;
			case 'r':
				w = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
				a = w[t.getDay()]
				m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				b = m[t.getMonth()]
				c = t.getTimezoneOffset()
				d = Math.abs(c)
				e = String(Math.floor(d / 60) * 100 + d % 60, 4)


				while (e.length < 4) {
					e = '0' + e;
				}

				f = (c > 0 ? '-' : '+') + e;

				arr[i] = a + ', ' + zero(t.getDate()) + ' ' + b + ' ' + t.getFullYear() + ' ' + zero(t.getHours()) + ':' + zero(t.getMinutes()) + ':' + zero(t.getSeconds()) + ' ' + f;
				break;
			case 'U':
				arr[i] = t / 1000 | 0;
				break;
			default:
				arr[i];
				break;
		}
	}
	return arr.join("");
};

global.mktime = (...arguments) => {
	let d = new Date(),
		date_manip = [
			tt => d.setHours(tt),
			tt => d.setMinutes(tt),
			tt => d.setSeconds(tt),
			tt => d.setMonth(parseInt(tt) - 1),
			tt => d.setDate(tt),
			tt => d.setYear(tt)
		]
	;

	arguments.forEach((arg, index) => {
		if(! empty(arg) || arg  === 0) {
			date_manip[index](arg)
		}
	})

	return Math.floor(d.getTime() / 1000);
}

global.week = (num = 0) => {
	if(num === 0) {return 'Воскресенье'}
	if(num === 1) {return 'Понедельник'}
	if(num === 2) {return 'Вторник'}
	if(num === 3) {return 'Среда'}
	if(num === 4) {return 'Четверг'}
	if(num === 5) {return 'Пятница'}
	if(num === 6) {return 'Суббота'}
}
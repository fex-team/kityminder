describe("protocal/plain", function () {
	var json, local, protocal;
	beforeEach(function () {
		protocal = KM.findProtocal('plain');
	});

	it('协议存在', function () {
		expect(protocal).toBeDefined();
	});

	it('正确 encode', function () {
		json = {
			data: {
				text: 'root',
				anyway: 'omg'
			},
			children: [{
				data: {
					text: 'l1c1'
				}
			}, {
				data: {
					text: 'l1c2'
				},
				children: [{
					data: {
						text: 'l2c1'
					}
				}, {
					data: {
						text: 'l2c2'
					}
				}]
			}, {
				data: {
					text: 'l1c3'
				}
			}]
		};
		local = protocal.encode(json);
		expect(local).toBe(
			'root\n' +
			'\tl1c1\n' +
			'\tl1c2\n' +
			'\t\tl2c1\n' +
			'\t\tl2c2\n' +
			'\tl1c3\n'
		);
	});
});
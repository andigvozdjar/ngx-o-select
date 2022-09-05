describe("jedini test za sad", () => {
    let sut: any;

    beforeEach(() => {
        sut = {};
    })

    it('should be true if true', () => {
        sut.a = false
        sut.a = true
        expect(sut.a).toBe(true)
    })

})
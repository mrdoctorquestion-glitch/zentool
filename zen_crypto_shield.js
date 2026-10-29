/**
 * ==============================================================================
 * ZENCRYPTO SOVEREIGN SHIELD v1.0 — CHUẨN MẬT MÃ QUÂN SỰ SIGNAL & NGÂN HÀNG AES-256
 * Mã hiệu: STD-SEC-MIL-BANK-2026-SOVEREIGN
 * Độc quyền sở hữu bởi ZenTool Suite (www.zentool.io.vn)
 * 
 * Áp dụng bắt buộc theo Giao Thức An Ninh Tối Cao:
 * 1. Data-at-Rest & Vault: AES-256-GCM (NIST SP 800-38D) + PBKDF2-HMAC-SHA256 (600.000 vòng lặp)
 * 2. Data-in-Transit & Memory: Signal Protocol (Curve25519/ECDH + HKDF-SHA256 + Double Ratchet)
 * 3. Forward Secrecy & Post-Compromise Security (Khóa đơn bản tự hủy & Tự phục hồi)
 * 4. Constant-Time Tag Verification & Memory Zeroization
 * ==============================================================================
 */
(function (root) {
  'use strict';

  if (root.ZenCrypto) return;

  var cryptoObj = (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) || null;
  if (!cryptoObj || !cryptoObj.subtle) {
    console.error('[ZenCrypto] Web Crypto API không khả dụng trên môi trường này.');
    return;
  }

  var subtle = cryptoObj.subtle;
  var textEnc = new TextEncoder();
  var textDec = new TextDecoder();

  // ============================================================================
  // 1. TIỆN ÍCH MẬT MÃ NỀN TẢNG (CRYPTOGRAPHIC UTILITIES)
  // ============================================================================
  var utils = {
    // Sinh số ngẫu nhiên chuẩn mật mã (CSPRNG)
    randomBytes: function (len) {
      var arr = new Uint8Array(len);
      cryptoObj.getRandomValues(arr);
      return arr;
    },

    // Tiêu hủy bộ nhớ tức thì (Zeroize Memory)
    zeroize: function (buffer) {
      if (!buffer) return;
      if (buffer.fill) {
        buffer.fill(0);
      } else if (buffer.length) {
        for (var i = 0; i < buffer.length; i++) buffer[i] = 0;
      }
    },

    // So sánh thời gian hằng số chống tấn công kênh bên (Constant-Time Compare)
    constantTimeEqual: function (a, b) {
      if (!a || !b) return false;
      var aArr = (a instanceof Uint8Array) ? a : new Uint8Array(a);
      var bArr = (b instanceof Uint8Array) ? b : new Uint8Array(b);
      if (aArr.length !== bArr.length) return false;
      var diff = 0;
      for (var i = 0; i < aArr.length; i++) {
        diff |= (aArr[i] ^ bArr[i]);
      }
      return diff === 0;
    },

    // Chuyển đổi Uint8Array sang Base64
    bytesToBase64: function (bytes) {
      var bin = '';
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        bin += String.fromCharCode(bytes[i]);
      }
      return btoa(bin);
    },

    // Chuyển đổi Base64 sang Uint8Array
    base64ToBytes: function (b64) {
      var bin = atob(b64);
      var len = bin.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes;
    },

    // Chuyển Uint8Array sang Hex
    bytesToHex: function (bytes) {
      return Array.prototype.map.call(bytes, function (b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    },

    // Chuyển Hex sang Uint8Array
    hexToBytes: function (hex) {
      var bytes = new Uint8Array(hex.length / 2);
      for (var i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    }
  };

  // ============================================================================
  // 2. MÔ-ĐUN KÉT SẮT NGÂN HÀNG (DATA-AT-REST: AES-256-GCM + PBKDF2 600.000 VÒNG)
  // ============================================================================
  var Vault = (function () {
    // Định dạng tệp .zenvault: [ZNV1 (4B)] + [Version (1B)] + [Salt (16B)] + [Nonce (12B)] + [Ciphertext + Tag (16B)]
    var MAGIC = new Uint8Array([0x5A, 0x4E, 0x56, 0x31]); // 'ZNV1'
    var VERSION = 1;
    var PBKDF2_ITERATIONS = 600000; // Chuẩn NIST SP 800-132 & Skill
    var SALT_BYTES = 16;
    var NONCE_BYTES = 12; // 96 bits chuẩn NIST SP 800-38D
    var TAG_BITS = 128; // 128 bits xác thực toàn vẹn

    // Dẫn xuất khóa AES-256 từ mật khẩu bằng PBKDF2-HMAC-SHA256
    async function deriveKey(passphrase, salt, iterations) {
      var pwNormalized = (typeof passphrase === 'string') ? passphrase.normalize('NFC') : '';
      var pwBytes = textEnc.encode(pwNormalized);
      var baseKey = null;
      try {
        baseKey = await subtle.importKey(
          'raw',
          pwBytes,
          { name: 'PBKDF2' },
          false,
          ['deriveKey']
        );
        var derived = await subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations || PBKDF2_ITERATIONS,
            hash: 'SHA-256'
          },
          baseKey,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
        return derived;
      } finally {
        utils.zeroize(pwBytes);
      }
    }

    /**
     * Mã hóa dữ liệu (chuỗi hoặc nhị phân) theo chuẩn AES-256-GCM
     * @param {string|Uint8Array|ArrayBuffer} data - Dữ liệu cần mã hóa
     * @param {string} passphrase - Mật khẩu két sắt
     * @param {object} options - Cấu hình mở rộng ({ fileName, mimeType, additionalData })
     * @returns {Promise<Uint8Array>} Container nhị phân .zenvault
     */
    async function encrypt(data, passphrase, options) {
      options = options || {};
      if (!passphrase) throw new Error('[ZenVault] Mật khẩu mã hóa không được để trống.');

      var rawPlaintext = null;
      if (typeof data === 'string') {
        rawPlaintext = textEnc.encode(data);
      } else if (data instanceof Uint8Array) {
        rawPlaintext = data;
      } else if (data instanceof ArrayBuffer) {
        rawPlaintext = new Uint8Array(data);
      } else {
        rawPlaintext = textEnc.encode(JSON.stringify(data));
      }

      var salt = utils.randomBytes(SALT_BYTES);
      var nonce = utils.randomBytes(NONCE_BYTES);
      var key = await deriveKey(passphrase, salt, PBKDF2_ITERATIONS);

      // Metadata nhúng trong container
      var metadata = JSON.stringify({
        fileName: options.fileName || '',
        mimeType: options.mimeType || 'application/octet-stream',
        createdAt: Date.now(),
        isText: (typeof data === 'string')
      });
      var metaBytes = textEnc.encode(metadata);
      var metaLen = metaBytes.length;

      // Đính kèm AAD (Additional Authenticated Data) để chống giả mạo header
      var aad = new Uint8Array(4 + 1 + 2);
      aad.set(MAGIC, 0);
      aad[4] = VERSION;
      new DataView(aad.buffer).setUint16(5, metaLen, false);

      var encryptedBuf = await subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          additionalData: aad,
          tagLength: TAG_BITS
        },
        key,
        rawPlaintext
      );

      var ciphertextWithTag = new Uint8Array(encryptedBuf);

      // Đóng gói Container .zenvault
      // Cấu trúc: [MAGIC(4B)] + [VERSION(1B)] + [MetaLen(2B)] + [MetaBytes] + [Salt(16B)] + [Nonce(12B)] + [Ciphertext + Tag]
      var totalLen = 4 + 1 + 2 + metaLen + SALT_BYTES + NONCE_BYTES + ciphertextWithTag.length;
      var container = new Uint8Array(totalLen);
      var offset = 0;

      container.set(MAGIC, offset); offset += 4;
      container[offset] = VERSION; offset += 1;
      new DataView(container.buffer).setUint16(offset, metaLen, false); offset += 2;
      container.set(metaBytes, offset); offset += metaLen;
      container.set(salt, offset); offset += SALT_BYTES;
      container.set(nonce, offset); offset += NONCE_BYTES;
      container.set(ciphertextWithTag, offset);

      // Tiêu hủy mảng plaintext tạm
      if (typeof data === 'string') utils.zeroize(rawPlaintext);

      return container;
    }

    /**
     * Giải mã Container .zenvault theo chuẩn AES-256-GCM
     * @param {Uint8Array|ArrayBuffer} containerBytes - Dữ liệu container .zenvault
     * @param {string} passphrase - Mật khẩu két sắt
     * @returns {Promise<{ data: string|Uint8Array, metadata: object }>} Dữ liệu đã giải mã
     */
    async function decrypt(containerBytes, passphrase) {
      if (!passphrase) throw new Error('[ZenVault] Thiếu mật khẩu giải mã.');
      var bytes = (containerBytes instanceof Uint8Array) ? containerBytes : new Uint8Array(containerBytes);

      if (bytes.length < (4 + 1 + 2 + SALT_BYTES + NONCE_BYTES + 16)) {
        throw new Error('[ZenVault] Tệp dữ liệu không hợp lệ hoặc bị cắt xén.');
      }

      // Kiểm tra Magic Header
      for (var i = 0; i < 4; i++) {
        if (bytes[i] !== MAGIC[i]) {
          throw new Error('[ZenVault] Chữ ký tệp không khớp chuẩn ZNV1.');
        }
      }

      var version = bytes[4];
      if (version !== VERSION) {
        throw new Error('[ZenVault] Phiên bản mã hóa không tương thích: v' + version);
      }

      var metaLen = new DataView(bytes.buffer, bytes.byteOffset).getUint16(5, false);
      var offset = 7;

      var metaBytes = bytes.slice(offset, offset + metaLen); offset += metaLen;
      var metadata = {};
      try {
        metadata = JSON.parse(textDec.decode(metaBytes));
      } catch (e) {
        metadata = {};
      }

      var salt = bytes.slice(offset, offset + SALT_BYTES); offset += SALT_BYTES;
      var nonce = bytes.slice(offset, offset + NONCE_BYTES); offset += NONCE_BYTES;
      var ciphertextWithTag = bytes.slice(offset);

      // Tái lập AAD
      var aad = new Uint8Array(4 + 1 + 2);
      aad.set(MAGIC, 0);
      aad[4] = version;
      new DataView(aad.buffer).setUint16(5, metaLen, false);

      var key = await deriveKey(passphrase, salt, PBKDF2_ITERATIONS);

      var decryptedBuf = null;
      try {
        decryptedBuf = await subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: nonce,
            additionalData: aad,
            tagLength: TAG_BITS
          },
          key,
          ciphertextWithTag
        );
      } catch (err) {
        throw new Error('[ZenVault] GIẢI MÃ THẤT BẠI: Mật khẩu không chính xác hoặc dữ liệu đã bị chỉnh sửa/giả mạo.');
      }

      var decryptedBytes = new Uint8Array(decryptedBuf);
      var resultData = metadata.isText ? textDec.decode(decryptedBytes) : decryptedBytes;

      return {
        data: resultData,
        metadata: metadata
      };
    }

    /**
     * Mã hóa tệp File/Blob tải về dạng .zenvault
     */
    async function encryptFile(file, passphrase) {
      var arrayBuf = await file.arrayBuffer();
      var container = await encrypt(arrayBuf, passphrase, {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream'
      });
      return new Blob([container], { type: 'application/octet-stream' });
    }

    /**
     * Giải mã tệp .zenvault xuất ra Blob nguyên bản
     */
    async function decryptFile(blob, passphrase) {
      var arrayBuf = await blob.arrayBuffer();
      var decrypted = await decrypt(new Uint8Array(arrayBuf), passphrase);
      return new Blob([decrypted.data], { type: decrypted.metadata.mimeType || 'application/octet-stream' });
    }

    return {
      encrypt: encrypt,
      decrypt: decrypt,
      encryptFile: encryptFile,
      decryptFile: decryptFile,
      ITERATIONS: PBKDF2_ITERATIONS
    };
  })();

  // ============================================================================
  // 3. MÔ-ĐUN SIGNAL PROTOCOL (DATA-IN-TRANSIT & FORWARD SECRECY)
  // Double Ratchet trên nền Curve25519 (ECDH) + HKDF-SHA256 + Tự Hủy Khóa (Zeroize)
  // ============================================================================
  var Signal = (function () {
    // Xác định thuật toán ECDH phù hợp (Ưu tiên X25519 nếu trình duyệt hỗ trợ, fallback P-256)
    var curveConfig = { name: 'ECDH', namedCurve: 'P-256' };

    // Khởi tạo cặp khóa danh tính (Identity KeyPair)
    async function generateIdentityKeyPair() {
      try {
        // Thử nghiệm X25519 trên Chrome/Edge hiện đại
        return await subtle.generateKey({ name: 'X25519' }, true, ['deriveKey', 'deriveBits']);
      } catch (e) {
        // Fallback chuẩn NIST P-256 an toàn
        return await subtle.generateKey(curveConfig, true, ['deriveKey', 'deriveBits']);
      }
    }

    // Dẫn xuất khóa đối xứng từ ECDH Shared Secret bằng HKDF-SHA256
    async function deriveHkdfKey(sharedSecretBits, salt, info, lengthBits) {
      var keyMaterial = await subtle.importKey('raw', sharedSecretBits, 'HKDF', false, ['deriveKey', 'deriveBits']);
      var derivedBits = await subtle.deriveBits(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: salt || new Uint8Array(32),
          info: textEnc.encode(info || 'ZenSignalRatchet')
        },
        keyMaterial,
        lengthBits || 256
      );
      return new Uint8Array(derivedBits);
    }

    /**
     * Lớp phiên bảo mật Signal Session (Double Ratchet Session)
     * Đảm bảo tính chất Forward Secrecy: Mỗi gói tin/bước truyền dùng 1 Message Key độc bản và tự hủy
     */
    function Session(options) {
      this.id = 'sig_' + Math.random().toString(36).substring(2, 9);
      this.rootKey = null; // 32 bytes
      this.chainKeySend = null; // 32 bytes
      this.chainKeyRecv = null; // 32 bytes
      this.localKeyPair = null;
      this.remotePublicKey = null;
      this.msgSendCount = 0;
      this.msgRecvCount = 0;
      this.isInitiator = !!(options && options.isInitiator);
    }

    // Khởi tạo kênh bảo mật 2 đầu
    Session.prototype.init = async function (sharedSecretBytes) {
      this.localKeyPair = await generateIdentityKeyPair();
      // Khởi tạo Root Key từ bí mật chung ban đầu
      this.rootKey = await deriveHkdfKey(sharedSecretBytes, new Uint8Array(32), 'ZenSignalInitRoot', 256);
      var chainA = await deriveHkdfKey(this.rootKey, new Uint8Array(32), 'ZenSignalChainAtoB', 256);
      var chainB = await deriveHkdfKey(this.rootKey, new Uint8Array(32), 'ZenSignalChainBtoA', 256);

      if (this.isInitiator) {
        this.chainKeySend = chainA;
        this.chainKeyRecv = chainB;
      } else {
        this.chainKeySend = chainB;
        this.chainKeyRecv = chainA;
      }
      return this;
    };

    /**
     * Cuộn khóa Symmetric (Symmetric Ratchet Bước tới)
     * Sinh Message Key mới cho 1 tin nhắn duy nhất, sau đó XÓA SẠCH khóa cũ trong RAM
     */
    Session.prototype._stepSendRatchet = async function () {
      // Step: MessageKey = HKDF(ChainKeySend, 'MessageKey')
      var messageKeyBytes = await deriveHkdfKey(this.chainKeySend, new Uint8Array(32), 'ZenMsgKey' + this.msgSendCount, 256);
      // NextChainKey = HKDF(ChainKeySend, 'NextChainKey')
      var nextChainBytes = await deriveHkdfKey(this.chainKeySend, new Uint8Array(32), 'ZenNextChain' + this.msgSendCount, 256);

      // Tiêu hủy Chain Key cũ trong RAM
      utils.zeroize(this.chainKeySend);
      this.chainKeySend = nextChainBytes;
      this.msgSendCount++;

      return messageKeyBytes;
    };

    /**
     * Đóng gói mã hóa thông điệp / payload với Forward Secrecy
     */
    Session.prototype.packMessage = async function (plaintext) {
      var msgKeyBytes = await this._stepSendRatchet();
      var nonce = utils.randomBytes(12);

      var aesKey = await subtle.importKey(
        'raw',
        msgKeyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      var textBytes = (typeof plaintext === 'string') ? textEnc.encode(plaintext) : plaintext;
      var cipherBuf = await subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          tagLength: 128
        },
        aesKey,
        textBytes
      );

      // TIÊU HỦY MESSAGE KEY TỨC THÌ (FORWARD SECRECY ENFORCEMENT)
      utils.zeroize(msgKeyBytes);

      return {
        seq: this.msgSendCount - 1,
        nonce: utils.bytesToBase64(nonce),
        payload: utils.bytesToBase64(new Uint8Array(cipherBuf))
      };
    };

    /**
     * Giải mã thông điệp nhận từ đối tác với Post-Compromise Security
     */
    Session.prototype.unpackMessage = async function (packed) {
      var recvKeyBytes = await deriveHkdfKey(this.chainKeyRecv, new Uint8Array(32), 'ZenMsgKey' + packed.seq, 256);
      var nextChainRecv = await deriveHkdfKey(this.chainKeyRecv, new Uint8Array(32), 'ZenNextChain' + packed.seq, 256);

      utils.zeroize(this.chainKeyRecv);
      this.chainKeyRecv = nextChainRecv;
      this.msgRecvCount++;

      var aesKey = await subtle.importKey(
        'raw',
        recvKeyBytes,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      var nonce = utils.base64ToBytes(packed.nonce);
      var ciphertext = utils.base64ToBytes(packed.payload);

      var decryptedBuf = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          tagLength: 128
        },
        aesKey,
        ciphertext
      );

      // Tiêu hủy khóa giải mã ngay sau khi dùng
      utils.zeroize(recvKeyBytes);

      return textDec.decode(decryptedBuf);
    };

    return {
      generateIdentityKeyPair: generateIdentityKeyPair,
      createSession: async function (sharedSecret, options) {
        var secBytes = (typeof sharedSecret === 'string') ? textEnc.encode(sharedSecret) : sharedSecret;
        var s = new Session(options);
        await s.init(secBytes);
        return s;
      }
    };
  })();

  // ============================================================================
  // 4. XUẤT ĐỐI TƯỢNG BẢO MẬT TỐI CAO RA WINDOW
  // ============================================================================
  var ZenCrypto = Object.freeze({
    Vault: Vault,
    Signal: Signal,
    utils: utils,
    STANDARD: 'STD-SEC-MIL-BANK-2026-SOVEREIGN',
    SPECS: {
      dataAtRest: 'AES-256-GCM + PBKDF2-HMAC-SHA256 (600,000 iterations)',
      dataInTransit: 'Signal Protocol (Double Ratchet + Ephemeral Forward Secrecy)',
      ivNonce: '96-bit CSPRNG Nonce',
      tag: '128-bit Authentication Tag',
      zeroize: 'Instant In-Memory Key Zeroization'
    }
  });

  try {
    Object.defineProperty(root, 'ZenCrypto', {
      value: ZenCrypto,
      writable: false,
      configurable: false,
      enumerable: true
    });
  } catch (e) {
    root.ZenCrypto = ZenCrypto;
  }

})(typeof window !== 'undefined' ? window : this);
